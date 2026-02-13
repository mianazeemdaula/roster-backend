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
import { ShiftTemplatesService } from './shift-templates.service';
import { CreateShiftTemplateDto } from './dto/create-shift-template.dto';
import { UpdateShiftTemplateDto } from './dto/update-shift-template.dto';

@Controller('shift-templates')
export class ShiftTemplatesController {
  constructor(private readonly shiftTemplatesService: ShiftTemplatesService) { }

  @Post()
  create(@Body() createShiftTemplateDto: CreateShiftTemplateDto) {
    return this.shiftTemplatesService.create(createShiftTemplateDto);
  }

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    if (companyId) {
      return this.shiftTemplatesService.findByCompany(Number(companyId));
    }
    return this.shiftTemplatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shiftTemplatesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShiftTemplateDto: UpdateShiftTemplateDto,
  ) {
    return this.shiftTemplatesService.update(id, updateShiftTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shiftTemplatesService.remove(id);
  }
}
