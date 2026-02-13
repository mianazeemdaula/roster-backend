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
import { ShiftAttachmentsService } from './shift-attachments.service';
import { CreateShiftAttachmentDto } from './dto/create-shift-attachment.dto';
import { UpdateShiftAttachmentDto } from './dto/update-shift-attachment.dto';

@Controller('shift-attachments')
export class ShiftAttachmentsController {
    constructor(
        private readonly shiftAttachmentsService: ShiftAttachmentsService,
    ) { }

    @Post()
    create(@Body() createShiftAttachmentDto: CreateShiftAttachmentDto) {
        return this.shiftAttachmentsService.create(createShiftAttachmentDto);
    }

    @Get()
    findAll(
        @Query('rosterId') rosterId?: string,
        @Query('fileType') fileType?: string,
    ) {
        if (rosterId) {
            return this.shiftAttachmentsService.findByRoster(Number(rosterId));
        }
        if (fileType) {
            return this.shiftAttachmentsService.findByFileType(fileType);
        }
        return this.shiftAttachmentsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.shiftAttachmentsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateShiftAttachmentDto: UpdateShiftAttachmentDto,
    ) {
        return this.shiftAttachmentsService.update(id, updateShiftAttachmentDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.shiftAttachmentsService.remove(id);
    }

    @Post('bulk')
    bulkCreate(
        @Body()
        body: {
            rosterId: number;
            attachments: Array<{ fileUrl: string; fileType: string }>;
        },
    ) {
        return this.shiftAttachmentsService.bulkCreate(
            body.rosterId,
            body.attachments,
        );
    }
}
