import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) { }

  create(createCompanyDto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: createCompanyDto,
    });
  }

  findAll() {
    return this.prisma.company.findMany();
  }

  findByOwner(ownerId: number) {
    return this.prisma.company.findMany({
      where: { ownerId },
      include: {
        owner: true,
      },
    });
  }

  findByCode(companyCode: string) {
    return this.prisma.company.findUnique({
      where: { companyCode },
      include: {
        owner: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.company.findUnique({
      where: { id },
    });
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  remove(id: number) {
    return this.prisma.company.delete({
      where: { id },
    });
  }
}
