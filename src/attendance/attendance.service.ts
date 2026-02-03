import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAttendanceDto: CreateAttendanceDto) {
    return this.prisma.attendance.create({
      data: createAttendanceDto,
    });
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

  update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    return this.prisma.attendance.update({
      where: { id },
      data: updateAttendanceDto,
    });
  }

  remove(id: number) {
    return this.prisma.attendance.delete({
      where: { id },
    });
  }
}
