import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { JobType, ShiftAdvertStatus } from '@prisma/client';
import { AcceptShiftAdvertDto } from './dto/accept-shift-advert.dto';
import { CreateShiftAdvertDto } from './dto/create-shift-advert.dto';
import { RespondShiftAdvertDto } from './dto/respond-shift-advert.dto';
import { ShiftAdvertsService } from './shift-adverts.service';

@Controller('shift-adverts')
export class ShiftAdvertsController {
    constructor(private readonly shiftAdvertsService: ShiftAdvertsService) { }

    private parseDate(value?: string) {
        if (!value) {
            return undefined;
        }

        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    }

    private parseNumber(value?: string) {
        if (!value) {
            return undefined;
        }

        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
    }

    @Post()
    create(@Body() dto: CreateShiftAdvertDto) {
        return this.shiftAdvertsService.create(dto);
    }

    @Get()
    findAll(
        @Query('companyId') companyId?: string,
        @Query('status') status?: ShiftAdvertStatus,
        @Query('jobTitle') jobTitle?: string,
        @Query('jobType') jobType?: JobType,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.shiftAdvertsService.findAll({
            companyId: this.parseNumber(companyId),
            status,
            jobTitle,
            jobType,
            from: this.parseDate(from),
            to: this.parseDate(to),
        });
    }

    @Post(':id/respond')
    respond(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: RespondShiftAdvertDto,
    ) {
        return this.shiftAdvertsService.respond(id, dto);
    }

    @Post(':id/accept')
    accept(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AcceptShiftAdvertDto,
    ) {
        return this.shiftAdvertsService.accept(id, dto);
    }

    @Patch(':id/cancel')
    cancel(@Param('id', ParseIntPipe) id: number) {
        return this.shiftAdvertsService.cancelAdvert(id);
    }

    @Patch(':id/close')
    close(@Param('id', ParseIntPipe) id: number) {
        return this.shiftAdvertsService.closeAdvert(id);
    }

    @Get(':id/responses')
    getResponses(@Param('id', ParseIntPipe) id: number) {
        return this.shiftAdvertsService.getResponses(id);
    }

    @Get(':id/willing-responses')
    getWillingResponses(@Param('id', ParseIntPipe) id: number) {
        return this.shiftAdvertsService.getWillingResponses(id);
    }

    @Get('location/:locationId')
    findByLocation(
        @Param('locationId', ParseIntPipe) locationId: number,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.shiftAdvertsService.findByLocation(
            locationId,
            this.parseDate(from),
            this.parseDate(to),
        );
    }
}
