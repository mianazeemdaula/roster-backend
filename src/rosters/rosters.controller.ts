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

  @Get('duty-hours/company/:companyId')
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
