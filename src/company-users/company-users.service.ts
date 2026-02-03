import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyUserDto } from './dto/create-company-user.dto';
import { UpdateCompanyUserDto } from './dto/update-company-user.dto';

@Injectable()
export class CompanyUsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCompanyUserDto: CreateCompanyUserDto) {
    return this.prisma.companyUser.create({
      data: createCompanyUserDto,
    });
  }

  findAll() {
    return this.prisma.companyUser.findMany({
      include: {
        user: true,
        company: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.companyUser.findUnique({
      where: { id },
      include: {
        user: true,
        company: true,
      },
    });
  }

  update(id: number, updateCompanyUserDto: UpdateCompanyUserDto) {
    return this.prisma.companyUser.update({
      where: { id },
      data: updateCompanyUserDto,
    });
  }

  remove(id: number) {
    return this.prisma.companyUser.delete({
      where: { id },
    });
  }
}
