import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRosterDto } from './dto/create-roster.dto';
import { UpdateRosterDto } from './dto/update-roster.dto';
import { RosterStatus } from '@prisma/client';

@Injectable()
export class RostersService {
  constructor(private readonly prisma: PrismaService) { }

  private calculateScheduledMinutes(
    startTime: string,
    endTime: string,
    breakMinutes: number,
  ): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    if ([startHours, startMinutes, endHours, endMinutes].some(Number.isNaN)) {
      return 0;
    }

    const startTotal = startHours * 60 + startMinutes;
    let endTotal = endHours * 60 + endMinutes;

    if (endTotal <= startTotal) {
      endTotal += 24 * 60;
    }

    const duration = endTotal - startTotal - Math.max(0, breakMinutes);

    return Math.max(0, duration);
  }

  private buildDateRangeFilter(from?: Date, to?: Date) {
    if (!from && !to) {
      return undefined;
    }

    return {
      dutyDate: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      },
    };
  }

  async create(createRosterDto: CreateRosterDto) {
    const shiftTemplate = await this.prisma.shiftTemplate.findUnique({
      where: { id: createRosterDto.shiftTemplateId },
      select: { startTime: true, endTime: true, breakMinutes: true },
    });

    const scheduledMinutes = shiftTemplate
      ? this.calculateScheduledMinutes(
        shiftTemplate.startTime,
        shiftTemplate.endTime,
        shiftTemplate.breakMinutes,
      )
      : undefined;

    const data = {
      ...createRosterDto,
      ...(scheduledMinutes !== undefined ? { scheduledMinutes } : {}),
    };

    return this.prisma.roster.create({
      data,
    });
  }

  findAll() {
    return this.prisma.roster.findMany({
      include: {
        employee: {
          include: {
            user: true,
          },
        },
        location: true,
        shiftTemplate: true,
      },
    });
  }

  findByCompany(
    companyId: number,
    filters?: {
      status?: RosterStatus;
      locationId?: number;
      companyUserId?: number;
      from?: Date;
      to?: Date;
    },
  ) {
    const dateFilter = this.buildDateRangeFilter(filters?.from, filters?.to);
    return this.prisma.roster.findMany({
      where: {
        companyId,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.locationId ? { locationId: filters.locationId } : {}),
        ...(filters?.companyUserId ? { companyUserId: filters.companyUserId } : {}),
        ...(dateFilter ?? {}),
      },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
        location: true,
        shiftTemplate: true,
        attendance: true,
      },
    });
  }

  findByLocation(locationId: number, from?: Date, to?: Date) {
    const dateFilter = this.buildDateRangeFilter(from, to);
    return this.prisma.roster.findMany({
      where: {
        locationId,
        ...(dateFilter ?? {}),
      },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
        location: true,
        shiftTemplate: true,
        attendance: true,
      },
    });
  }

  findByUser(companyUserId: number, from?: Date, to?: Date) {
    const dateFilter = this.buildDateRangeFilter(from, to);
    return this.prisma.roster.findMany({
      where: {
        companyUserId,
        ...(dateFilter ?? {}),
      },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
        location: true,
        shiftTemplate: true,
        attendance: true,
      },
      orderBy: {
        dutyDate: 'desc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.roster.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
        location: true,
        shiftTemplate: true,
        attendance: true,
      },
    });
  }

  async update(id: number, updateRosterDto: UpdateRosterDto) {
    let scheduledMinutes: number | undefined;

    if (updateRosterDto.shiftTemplateId) {
      const shiftTemplate = await this.prisma.shiftTemplate.findUnique({
        where: { id: updateRosterDto.shiftTemplateId },
        select: { startTime: true, endTime: true, breakMinutes: true },
      });

      if (shiftTemplate) {
        scheduledMinutes = this.calculateScheduledMinutes(
          shiftTemplate.startTime,
          shiftTemplate.endTime,
          shiftTemplate.breakMinutes,
        );
      }
    }

    return this.prisma.roster.update({
      where: { id },
      data: {
        ...updateRosterDto,
        ...(scheduledMinutes !== undefined ? { scheduledMinutes } : {}),

        async updateStatus(id: number, status: RosterStatus) {
          return this.prisma.roster.update({
            where: { id },
            data: { status },
          });
        }

  async completeRoster(id: number) {
          return this.updateStatus(id, RosterStatus.COMPLETED);
        }

  async cancelRoster(id: number) {
          return this.updateStatus(id, RosterStatus.CANCELLED);
        }

  async markAsMissed(id: number) {
          return this.updateStatus(id, RosterStatus.MISSED);
        }

  async bulkCreate(rosters: CreateRosterDto[]) {
          const rostersWithScheduledMinutes = await Promise.all(
            rosters.map(async (roster) => {
              const shiftTemplate = await this.prisma.shiftTemplate.findUnique({
                where: { id: roster.shiftTemplateId },
                select: { startTime: true, endTime: true, breakMinutes: true },
              });

              const scheduledMinutes = shiftTemplate
                ? this.calculateScheduledMinutes(
                  shiftTemplate.startTime,
                  shiftTemplate.endTime,
                  shiftTemplate.breakMinutes,
                )
                : undefined;

              return {
                ...roster,
                ...(scheduledMinutes !== undefined ? { scheduledMinutes } : {}),
              };
            }),
          );

          return this.prisma.roster.createMany({
            data: rostersWithScheduledMinutes,
          });
        }
      },
    });
  }

  async getDutyHoursByCompany(
    companyId: number,
    from?: Date,
    to?: Date,
  ) {
    const dateFilter = this.buildDateRangeFilter(from, to);
    const where = {
      companyId,
      ...(dateFilter ?? {}),
    };

    const [scheduled, actual, rosterCount] = await Promise.all([
      this.prisma.roster.aggregate({
        where,
        _sum: { scheduledMinutes: true },
      }),
      this.prisma.roster.aggregate({
        where,
        _sum: { actualMinutes: true },
      }),
      this.prisma.roster.count({ where }),
    ]);

    return {
      companyId,
      from,
      to,
      rosterCount,
      totalScheduledMinutes: scheduled._sum.scheduledMinutes ?? 0,
      totalActualMinutes: actual._sum.actualMinutes ?? 0,
    };
  }

  async getDutyHoursByCompanyUser(
    companyUserId: number,
    from?: Date,
    to?: Date,
  ) {
    const dateFilter = this.buildDateRangeFilter(from, to);
    const where = {
      companyUserId,
      ...(dateFilter ?? {}),
    };

    const [scheduled, actual, rosterCount] = await Promise.all([
      this.prisma.roster.aggregate({
        where,
        _sum: { scheduledMinutes: true },
      }),
      this.prisma.roster.aggregate({
        where,
        _sum: { actualMinutes: true },
      }),
      this.prisma.roster.count({ where }),
    ]);

    return {
      companyUserId,
      from,
      to,
      rosterCount,
      totalScheduledMinutes: scheduled._sum.scheduledMinutes ?? 0,
      totalActualMinutes: actual._sum.actualMinutes ?? 0,
    };
  }

  remove(id: number) {
    return this.prisma.roster.delete({
      where: { id },
    });
  }
}
