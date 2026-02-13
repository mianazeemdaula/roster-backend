import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) { }

  create(createLocationDto: CreateLocationDto) {
    return this.prisma.location.create({
      data: createLocationDto,
    });
  }

  findAll() {
    return this.prisma.location.findMany();
  }

  findByCompany(companyId: number) {
    return this.prisma.location.findMany({
      where: { companyId },
      include: {
        company: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.location.findUnique({
      where: { id },
    });
  }

  update(id: number, updateLocationDto: UpdateLocationDto) {
    return this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  remove(id: number) {
    return this.prisma.location.delete({
      where: { id },
    });
  }
}
