import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';

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

  findByRoster(rosterId: number) {
    return this.prisma.attendance.findUnique({
      where: { rosterId },
      include: {
        roster: {
          include: {
            employee: {
              include: {
                user: true,
              },
            },
            location: true,
            shiftTemplate: true,
          },
        },
      },
    });
  }

  async findByCompanyUser(companyUserId: number, from?: Date, to?: Date) {
    const dateFilter = from || to ? {
      roster: {
        dutyDate: {
          ...(from ? { gte: from } : {}),
          ...(to ? { lte: to } : {}),
        },
      },
    } : {};

    return this.prisma.attendance.findMany({
      where: {
        roster: {
          companyUserId,

          async checkIn(checkInDto: CheckInDto) {
            const { rosterId, checkInLat, checkInLng, checkInPhoto } = checkInDto;

            // Check if attendance record already exists
            let attendance = await this.prisma.attendance.findUnique({
              where: { rosterId },
            });

            if (attendance) {
              // Update existing record
              attendance = await this.prisma.attendance.update({
                where: { rosterId },
                data: {
                  checkInTime: new Date(),
                  checkInLat,
                  checkInLng,
                  checkInPhoto,
                },
              });
            } else {
              // Create new record
              attendance = await this.prisma.attendance.create({
                data: {
                  rosterId,
                  checkInTime: new Date(),
                  checkInLat,
                  checkInLng,
                  checkInPhoto,
                },
              });
            }

            return attendance;
          }

  async checkOut(checkOutDto: CheckOutDto) {
            const { rosterId, checkOutPhoto } = checkOutDto;

            const attendance = await this.prisma.attendance.update({
              where: { rosterId },
              data: {
                checkOutTime: new Date(),
                checkOutPhoto,
              },
            });

            // Calculate and update actual minutes
            const actualMinutes = this.calculateActualMinutes(
              attendance.checkInTime ?? undefined,
              attendance.checkOutTime ?? undefined,
            );

            if (actualMinutes !== null) {
              await this.prisma.roster.update({
                where: { id: rosterId },
                data: { actualMinutes },
              });
            }

            return attendance;
          }
        },
        ...dateFilter,
      },
      include: {
        roster: {
          include: {
            location: true,
            shiftTemplate: true,
          },
        },
      },
    });
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
