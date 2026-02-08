import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyUserDto } from './dto/create-company-user.dto';
import { UpdateCompanyUserDto } from './dto/update-company-user.dto';
import { CompanyRole } from '@prisma/client';

@Injectable()
export class CompanyUsersService {
  constructor(private readonly prisma: PrismaService) { }

  create(createCompanyUserDto: CreateCompanyUserDto) {
    return this.prisma.companyUser.create({
      data: createCompanyUserDto,
    });
  }

  findAll() {
    return this.prisma.companyUser.findMany({
      include: {
        user: true,
        company: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.companyUser.findUnique({
      where: { id },
      include: {
        user: true,
        company: true,
      },
    });
  }

  update(id: number, updateCompanyUserDto: UpdateCompanyUserDto) {
    return this.prisma.companyUser.update({
      where: { id },
      data: updateCompanyUserDto,
    });
  }

  remove(id: number) {
    return this.prisma.companyUser.delete({
      where: { id },
    });
  }

  /**
   * Regular user leaves a company
   * Admin users must use adminLeaveCompany instead
   */
  async leaveCompany(userId: number, companyId: number) {
    const companyUser = await this.prisma.companyUser.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    if (!companyUser || !companyUser.isActive) {
      throw new BadRequestException('User is not an active member of this company');
    }

    if (companyUser.role === CompanyRole.admin) {
      throw new BadRequestException(
        'Admin must transfer role before leaving. Use admin-leave endpoint instead.',
      );
    }

    return this.prisma.companyUser.update({
      where: { id: companyUser.id },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });
  }

  /**
   * Transfer admin role from one user to another
   * Records the transfer in AdminTransfer table for audit trail
   */
  async transferAdminRole(
    currentAdminUserId: number,
    newAdminUserId: number,
    companyId: number,
    reason?: string,
  ) {
    if (currentAdminUserId === newAdminUserId) {
      throw new BadRequestException('Cannot transfer admin role to yourself');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Verify current admin
      const currentAdmin = await tx.companyUser.findFirst({
        where: {
          userId: currentAdminUserId,
          companyId,
          role: CompanyRole.admin,
          isActive: true,
        },
      });

      if (!currentAdmin) {
        throw new BadRequestException('Current user is not an active admin of this company');
      }

      // Verify new admin exists and is active
      const newAdmin = await tx.companyUser.findFirst({
        where: {
          userId: newAdminUserId,
          companyId,
          isActive: true,
        },
      });

      if (!newAdmin) {
        throw new BadRequestException(
          'New admin must be an active member of the company',
        );
      }

      // Update roles - demote current admin to manager
      await tx.companyUser.update({
        where: { id: currentAdmin.id },
        data: { role: CompanyRole.manager },
      });

      // Promote new admin
      await tx.companyUser.update({
        where: { id: newAdmin.id },
        data: { role: CompanyRole.admin },
      });

      // Record the transfer for audit trail
      const transfer = await tx.adminTransfer.create({
        data: {
          companyId,
          fromCompanyUserId: currentAdmin.id,
          toCompanyUserId: newAdmin.id,
          reason: reason || 'Admin role transfer',
        },
        include: {
          fromCompanyUser: {
            include: { user: true },
          },
          toCompanyUser: {
            include: { user: true },
          },
        },
      });

      return {
        success: true,
        message: 'Admin role transferred successfully',
        transfer,
      };
    });
  }

  /**
   * Admin leaves company - must transfer role first
   * This is a combined operation: transfer admin role, then leave
   */
  async adminLeaveCompany(
    adminUserId: number,
    newAdminUserId: number,
    companyId: number,
    reason?: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // First verify the admin
      const adminUser = await tx.companyUser.findFirst({
        where: {
          userId: adminUserId,
          companyId,
          role: CompanyRole.admin,
          isActive: true,
        },
      });

      if (!adminUser) {
        throw new BadRequestException('User is not an active admin of this company');
      }

      // Check if there are other active members to transfer to
      const newAdmin = await tx.companyUser.findFirst({
        where: {
          userId: newAdminUserId,
          companyId,
          isActive: true,
        },
      });

      if (!newAdmin) {
        throw new BadRequestException(
          'Cannot find an active member to transfer admin role to',
        );
      }

      // Transfer the admin role
      await tx.companyUser.update({
        where: { id: newAdmin.id },
        data: { role: CompanyRole.admin },
      });

      // Record the transfer
      await tx.adminTransfer.create({
        data: {
          companyId,
          fromCompanyUserId: adminUser.id,
          toCompanyUserId: newAdmin.id,
          reason: reason || 'Admin leaving company',
        },
      });

      // Now the user can leave (they're no longer admin)
      await tx.companyUser.update({
        where: { id: adminUser.id },
        data: {
          role: CompanyRole.employee,
          isActive: false,
          leftAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Admin role transferred and user left the company successfully',
      };
    });
  }

  /**
   * User rejoins a company they previously left
   * May require admin approval (isRequested flag)
   */
  async rejoinCompany(userId: number, companyId: number) {
    const existingMembership = await this.prisma.companyUser.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    if (!existingMembership) {
      throw new BadRequestException(
        'No previous membership found. Use create endpoint to join as new member.',
      );
    }

    if (existingMembership.isActive) {
      throw new BadRequestException('User is already an active member of this company');
    }

    return this.prisma.companyUser.update({
      where: { id: existingMembership.id },
      data: {
        isActive: true,
        leftAt: null, // Clear the leftAt timestamp
        isRequested: true, // May need approval to rejoin
      },
      include: {
        user: true,
        company: true,
      },
    });
  }

  /**
   * Get complete history of a user's company memberships
   * Includes both active and inactive memberships
   */
  async getUserCompanyHistory(userId: number) {
    return this.prisma.companyUser.findMany({
      where: { userId },
      include: {
        company: true,
        rosters: {
          take: 5, // Include recent rosters for context
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [
        { isActive: 'desc' }, // Active memberships first
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get admin transfer history for a company
   * Provides audit trail of all admin role changes
   */
  async getAdminTransferHistory(companyId: number) {
    return this.prisma.adminTransfer.findMany({
      where: { companyId },
      include: {
        fromCompanyUser: {
          include: { user: true },
        },
        toCompanyUser: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all active admins for a company
   */
  async getCompanyAdmins(companyId: number) {
    return this.prisma.companyUser.findMany({
      where: {
        companyId,
        role: CompanyRole.admin,
        isActive: true,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Get active members of a company (excluding inactive/left members)
   */
  async getActiveCompanyMembers(companyId: number) {
    return this.prisma.companyUser.findMany({
      where: {
        companyId,
        isActive: true,
      },
      include: {
        user: true,
      },
      orderBy: [
        { role: 'asc' }, // admins first, then managers, then employees
        { createdAt: 'desc' },
      ],
    });
  }
}
