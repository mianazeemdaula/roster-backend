import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRosterDto } from './dto/create-roster.dto';
import { UpdateRosterDto } from './dto/update-roster.dto';

@Injectable()
export class RostersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createRosterDto: CreateRosterDto) {
    return this.prisma.roster.create({
      data: createRosterDto,
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

  update(id: number, updateRosterDto: UpdateRosterDto) {
    return this.prisma.roster.update({
      where: { id },
      data: updateRosterDto,
    });
  }

  remove(id: number) {
    return this.prisma.roster.delete({
      where: { id },
    });
  }
}
