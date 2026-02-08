import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ShiftAdvertsController } from './shift-adverts.controller';
import { ShiftAdvertsService } from './shift-adverts.service';

@Module({
    imports: [PrismaModule],
    controllers: [ShiftAdvertsController],
    providers: [ShiftAdvertsService],
})
export class ShiftAdvertsModule { }
