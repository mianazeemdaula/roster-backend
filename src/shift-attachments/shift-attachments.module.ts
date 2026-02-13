import { Module } from '@nestjs/common';
import { ShiftAttachmentsService } from './shift-attachments.service';
import { ShiftAttachmentsController } from './shift-attachments.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ShiftAttachmentsController],
    providers: [ShiftAttachmentsService],
    exports: [ShiftAttachmentsService],
})
export class ShiftAttachmentsModule { }
