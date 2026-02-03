import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShiftTemplateDto } from './dto/create-shift-template.dto';
import { UpdateShiftTemplateDto } from './dto/update-shift-template.dto';

@Injectable()
export class ShiftTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createShiftTemplateDto: CreateShiftTemplateDto) {
    return this.prisma.shiftTemplate.create({
      data: createShiftTemplateDto,
    });
  }

  findAll() {
    return this.prisma.shiftTemplate.findMany();
  }

  findOne(id: number) {
    return this.prisma.shiftTemplate.findUnique({
      where: { id },
    });
  }

  update(id: number, updateShiftTemplateDto: UpdateShiftTemplateDto) {
    return this.prisma.shiftTemplate.update({
      where: { id },
      data: updateShiftTemplateDto,
    });
  }

  remove(id: number) {
    return this.prisma.shiftTemplate.delete({
      where: { id },
    });
  }
}
