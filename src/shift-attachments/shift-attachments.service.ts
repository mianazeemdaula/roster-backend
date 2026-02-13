import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShiftAttachmentDto } from './dto/create-shift-attachment.dto';
import { UpdateShiftAttachmentDto } from './dto/update-shift-attachment.dto';

@Injectable()
export class ShiftAttachmentsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createShiftAttachmentDto: CreateShiftAttachmentDto) {
        return this.prisma.shiftAttachment.create({
            data: createShiftAttachmentDto,
            include: {
                roster: true,
            },
        });
    }

    async findAll() {
        return this.prisma.shiftAttachment.findMany({
            include: {
                roster: true,
            },
        });
    }

    async findByRoster(rosterId: number) {
        return this.prisma.shiftAttachment.findMany({
            where: { rosterId },
            include: {
                roster: true,
            },
        });
    }

    async findByFileType(fileType: string) {
        return this.prisma.shiftAttachment.findMany({
            where: { fileType },
            include: {
                roster: true,
            },
        });
    }

    async findOne(id: number) {
        const attachment = await this.prisma.shiftAttachment.findUnique({
            where: { id },
            include: {
                roster: true,
            },
        });

        if (!attachment) {
            throw new NotFoundException(`Shift attachment with ID ${id} not found`);
        }

        return attachment;
    }

    async update(id: number, updateShiftAttachmentDto: UpdateShiftAttachmentDto) {
        await this.findOne(id);
        return this.prisma.shiftAttachment.update({
            where: { id },
            data: updateShiftAttachmentDto,
            include: {
                roster: true,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.shiftAttachment.delete({
            where: { id },
        });
    }

    async bulkCreate(rosterId: number, attachments: Array<{ fileUrl: string; fileType: string }>) {
        const data = attachments.map(att => ({
            rosterId,
            fileUrl: att.fileUrl,
            fileType: att.fileType,
        }));

        return this.prisma.shiftAttachment.createMany({
            data,
        });
    }
}
