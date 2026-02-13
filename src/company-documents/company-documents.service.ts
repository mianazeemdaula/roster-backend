import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDocumentDto } from './dto/create-company-document.dto';
import { UpdateCompanyDocumentDto } from './dto/update-company-document.dto';

@Injectable()
export class CompanyDocumentsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createCompanyDocumentDto: CreateCompanyDocumentDto) {
        return this.prisma.compnayDocument.create({
            data: createCompanyDocumentDto,
        });
    }

    async findAll() {
        return this.prisma.compnayDocument.findMany({
            include: {
                company: true,
            },
        });
    }

    async findByCompany(companyId: number) {
        return this.prisma.compnayDocument.findMany({
            where: { companyId },
            include: {
                company: true,
            },
        });
    }

    async findByType(companyId: number, docType: string) {
        return this.prisma.compnayDocument.findMany({
            where: {
                companyId,
                docType,
            },
        });
    }

    async findOne(id: number) {
        const document = await this.prisma.compnayDocument.findUnique({
            where: { id },
            include: {
                company: true,
            },
        });

        if (!document) {
            throw new NotFoundException(`Company document with ID ${id} not found`);
        }

        return document;
    }

    async update(id: number, updateCompanyDocumentDto: UpdateCompanyDocumentDto) {
        await this.findOne(id);
        return this.prisma.compnayDocument.update({
            where: { id },
            data: updateCompanyDocumentDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.compnayDocument.delete({
            where: { id },
        });
    }
}
