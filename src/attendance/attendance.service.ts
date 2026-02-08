import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) { }

  private calculateActualMinutes(checkInTime?: Date, checkOutTime?: Date) {
    if (!checkInTime || !checkOutTime) {
      return null;
    }

    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    if (diffMs <= 0) {
      return 0;
    }

    return Math.floor(diffMs / 60000);
  }

  async create(createAttendanceDto: CreateAttendanceDto) {
    const attendance = await this.prisma.attendance.create({
      data: createAttendanceDto,
    });

    const actualMinutes = this.calculateActualMinutes(
      attendance.checkInTime ?? undefined,
      attendance.checkOutTime ?? undefined,
    );

    if (actualMinutes !== null) {
      await this.prisma.roster.update({
        where: { id: attendance.rosterId },
        data: { actualMinutes },
      });
    }

    return attendance;
  }

  findAll() {
    return this.prisma.attendance.findMany();
  }

  findOne(id: number) {
    return this.prisma.attendance.findUnique({
      where: { id },
      include: {
        roster: true,
      },
    });
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.prisma.attendance.update({
      where: { id },
      data: updateAttendanceDto,
    });

    const actualMinutes = this.calculateActualMinutes(
      attendance.checkInTime ?? undefined,
      attendance.checkOutTime ?? undefined,
    );

    await this.prisma.roster.update({
      where: { id: attendance.rosterId },
      data: { actualMinutes },
    });

    return attendance;
  }

  remove(id: number) {
    return this.prisma.attendance.delete({
      where: { id },
    });
  }
}
