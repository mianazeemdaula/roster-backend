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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  private parseDate(value?: string) {
    if (!value) {
      return undefined;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  @Post()
  createroster/:rosterId')
findByRoster(@Param('rosterId', ParseIntPipe) rosterId: number) {
  return this.attendanceService.findByRoster(rosterId);
}

@Get('user/:companyUserId')
findByCompanyUser(
  @Param('companyUserId', ParseIntPipe) companyUserId: number,
  @Query('from') from ?: string,
  @Query('to') to ?: string,
) {
  return this.attendanceService.findByCompanyUser(
    companyUserId,
    this.parseDate(from),
    this.parseDate(to),
  );
}

@Get('(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

@Get()
findAll() {
  return this.attendanceService.findAll();
}

@Post('check-in')
checkIn(@Body() checkInDto: CheckInDto) {
  return this.attendanceService.checkIn(checkInDto);
}

@Post('check-out')
checkOut(@Body() checkOutDto: CheckOutDto) {
  return this.attendanceService.checkOut(checkOutDto);
}

@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.attendanceService.findOne(id);
}

@Patch(':id')
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateAttendanceDto: UpdateAttendanceDto,
) {
  return this.attendanceService.update(id, updateAttendanceDto);
}

@Delete(':id')
remove(@Param('id', ParseIntPipe) id: number) {
  return this.attendanceService.remove(id);
}
}
