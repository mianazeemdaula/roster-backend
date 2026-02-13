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
import { CompanyDocumentsService } from './company-documents.service';
import { CreateCompanyDocumentDto } from './dto/create-company-document.dto';
import { UpdateCompanyDocumentDto } from './dto/update-company-document.dto';

@Controller('company-documents')
export class CompanyDocumentsController {
    constructor(
        private readonly companyDocumentsService: CompanyDocumentsService,
    ) { }

    @Post()
    create(@Body() createCompanyDocumentDto: CreateCompanyDocumentDto) {
        return this.companyDocumentsService.create(createCompanyDocumentDto);
    }

    @Get()
    findAll(@Query('companyId') companyId?: string) {
        if (companyId) {
            return this.companyDocumentsService.findByCompany(Number(companyId));
        }
        return this.companyDocumentsService.findAll();
    }

    @Get('by-type')
    findByType(
        @Query('companyId', ParseIntPipe) companyId: number,
        @Query('docType') docType: string,
    ) {
        return this.companyDocumentsService.findByType(companyId, docType);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.companyDocumentsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCompanyDocumentDto: UpdateCompanyDocumentDto,
    ) {
        return this.companyDocumentsService.update(id, updateCompanyDocumentDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.companyDocumentsService.remove(id);
    }
}
