import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RostersService } from './rosters.service';
import { CreateRosterDto } from './dto/create-roster.dto';
import { UpdateRosterDto } from './dto/update-roster.dto';
import { RosterStatus } from '@prisma/client';

@Controller('rosters')
export class RostersController {
  constructor(private readonly rostersService: RostersService) { }

  private parseDate(value?: string) {
    if (!value) {
      return undefined;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  @Post()
  create(@Body() createRosterDto: CreateRosterDto) {
    return this.rostersService.create(createRosterDto);
  }

  @Get()
  findAll() {
    return this.rostersService.findAll();
  }

  @Get('company/:companyId')
  findByCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('status') status?: RosterStatus,
    @Query('locationId') locationId?: string,
    @Query('companyUserId') companyUserId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.rostersService.findByCompany(companyId, {
      status,
      locationId: locationId ? Number(locationId) : undefined,
      companyUserId: companyUserId ? Number(companyUserId) : undefined,
      from: this.parseDate(from),
      to: this.parseDate(to),
    });
  }

  @Get('location/:locationId')
  findByLocation(
    @Param('locationId', ParseIntPipe) locationId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.rostersService.findByLocation(
      locationId,
      this.parseDate(from),
      this.parseDate(to),
    );
  }

  @Get('user/:companyUserId')
  findByUser(
    @Param('companyUserId', ParseIntPipe) companyUserId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.rostersService.findByUser(
      companyUserId,
      this.parseDate(from),
      this.parseDate(to),
    );
  }

  @Get('duty-hours/company/:companyId')

  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.rostersService.completeRoster(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.rostersService.cancelRoster(id);
  }

  @Patch(':id/mark-missed')
  markMissed(@Param('id', ParseIntPipe) id: number) {
    return this.rostersService.markAsMissed(id);
  }

  @Post('bulk')
  bulkCreate(@Body() body: { rosters: CreateRosterDto[] }) {
    return this.rostersService.bulkCreate(body.rosters);
  }
  getDutyHoursByCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = this.parseDate(from);
    const toDate = this.parseDate(to);

    return this.rostersService.getDutyHoursByCompany(companyId, fromDate, toDate);
  }

  @Get('duty-hours/user/:companyUserId')
  getDutyHoursByCompanyUser(
    @Param('companyUserId', ParseIntPipe) companyUserId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = this.parseDate(from);
    const toDate = this.parseDate(to);

    return this.rostersService.getDutyHoursByCompanyUser(
      companyUserId,
      fromDate,
      toDate,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rostersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRosterDto: UpdateRosterDto,
  ) {
    return this.rostersService.update(id, updateRosterDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rostersService.remove(id);
  }
}
