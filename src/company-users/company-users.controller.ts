import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CompanyUsersService } from './company-users.service';
import { CreateCompanyUserDto } from './dto/create-company-user.dto';
import { UpdateCompanyUserDto } from './dto/update-company-user.dto';
import { LeaveCompanyDto } from './dto/leave-company.dto';
import { TransferAdminDto } from './dto/transfer-admin.dto';
import { AdminLeaveCompanyDto } from './dto/admin-leave-company.dto';
import { RejoinCompanyDto } from './dto/rejoin-company.dto';

@Controller('company-users')
export class CompanyUsersController {
  constructor(private readonly companyUsersService: CompanyUsersService) { }

  @Post()
  create(@Body() createCompanyUserDto: CreateCompanyUserDto) {
    return this.companyUsersService.create(createCompanyUserDto);
  }

  @Get()
  findAll() {
    return this.companyUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companyUsersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyUserDto: UpdateCompanyUserDto,
  ) {
    return this.companyUsersService.update(id, updateCompanyUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.companyUsersService.remove(id);
  }

  /**
   * Regular user leaves a company
   * POST /company-users/leave
   */
  @Post('leave')
  leaveCompany(@Body() leaveCompanyDto: LeaveCompanyDto) {
    return this.companyUsersService.leaveCompany(
      leaveCompanyDto.userId,
      leaveCompanyDto.companyId,
    );
  }

  /**
   * Transfer admin role to another user
   * POST /company-users/transfer-admin
   */
  @Post('transfer-admin')
  transferAdmin(@Body() transferAdminDto: TransferAdminDto) {
    return this.companyUsersService.transferAdminRole(
      transferAdminDto.currentAdminUserId,
      transferAdminDto.newAdminUserId,
      transferAdminDto.companyId,
      transferAdminDto.reason,
    );
  }

  /**
   * Admin leaves company (with mandatory transfer)
   * POST /company-users/admin-leave
   */
  @Post('admin-leave')
  adminLeaveCompany(@Body() adminLeaveCompanyDto: AdminLeaveCompanyDto) {
    return this.companyUsersService.adminLeaveCompany(
      adminLeaveCompanyDto.adminUserId,
      adminLeaveCompanyDto.newAdminUserId,
      adminLeaveCompanyDto.companyId,
      adminLeaveCompanyDto.reason,
    );
  }

  /**
   * User rejoins a company they previously left
   * POST /company-users/rejoin
   */
  @Post('rejoin')
  rejoinCompany(@Body() rejoinCompanyDto: RejoinCompanyDto) {
    return this.companyUsersService.rejoinCompany(
      rejoinCompanyDto.userId,
      rejoinCompanyDto.companyId,
    );
  }

  /**
   * Get user's complete company membership history
   * GET /company-users/history/:userId
   */
  @Get('history/:userId')
  getUserCompanyHistory(@Param('userId', ParseIntPipe) userId: number) {
    return this.companyUsersService.getUserCompanyHistory(userId);
  }

  /**
   * Get admin transfer history for a company
   * GET /company-users/:companyId/admin-history
   */
  @Get(':companyId/admin-history')
  getAdminTransferHistory(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.companyUsersService.getAdminTransferHistory(companyId);
  }

  /**
   * Get all active admins for a company
   * GET /company-users/:companyId/admins
   */
  @Get(':companyId/admins')
  getCompanyAdmins(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.companyUsersService.getCompanyAdmins(companyId);
  }

  /**
   * Get all active members of a company
   * GET /company-users/:companyId/active-members
   */
  @Get(':companyId/active-members')
  getActiveMembers(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.companyUsersService.getActiveCompanyMembers(companyId);
  }
}
