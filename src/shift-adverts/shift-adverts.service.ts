import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    JobType,
    ShiftAdvertResponseStatus,
    ShiftAdvertStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AcceptShiftAdvertDto } from './dto/accept-shift-advert.dto';
import { CreateShiftAdvertDto } from './dto/create-shift-advert.dto';
import { RespondShiftAdvertDto } from './dto/respond-shift-advert.dto';

@Injectable()
export class ShiftAdvertsService {
    constructor(private readonly prisma: PrismaService) { }

    private calculateScheduledMinutes(
        startTime: string,
        endTime: string,
        breakMinutes: number,
    ): number {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        if ([startHours, startMinutes, endHours, endMinutes].some(Number.isNaN)) {
            return 0;
        }

        const startTotal = startHours * 60 + startMinutes;
        let endTotal = endHours * 60 + endMinutes;

        if (endTotal <= startTotal) {
            endTotal += 24 * 60;
        }

        const duration = endTotal - startTotal - Math.max(0, breakMinutes);

        return Math.max(0, duration);
    }

    private buildDateRangeFilter(from?: Date, to?: Date) {
        if (!from && !to) {
            return undefined;
        }

        return {
            dutyDate: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
            },
        };
    }

    async create(createShiftAdvertDto: CreateShiftAdvertDto) {
        const advert = await this.prisma.shiftAdvert.create({
            data: createShiftAdvertDto,
        });

        const targetUsers = await this.prisma.companyUser.findMany({
            where: {
                companyId: advert.companyId,
                isActive: true,
                jobTitle: advert.jobTitle,
                ...(advert.jobType ? { jobType: advert.jobType } : {}),
            },
            select: { userId: true },
        });

        if (targetUsers.length > 0) {
            const dutyDate = advert.dutyDate.toISOString().split('T')[0];
            await this.prisma.notification.createMany({
                data: targetUsers.map((target) => ({
                    userId: target.userId,
                    title: 'New shift advert',
                    message: `New ${advert.jobTitle} shift on ${dutyDate}.`,
                })),
            });
        }

        return advert;
    }

    findAll(options: {
        companyId?: number;
        status?: ShiftAdvertStatus;
        jobTitle?: string;
        jobType?: JobType;
        from?: Date;
        to?: Date;
    }) {
        const dateFilter = this.buildDateRangeFilter(options.from, options.to);

        return this.prisma.shiftAdvert.findMany({
            where: {
                ...(options.companyId ? { companyId: options.companyId } : {}),
                ...(options.status ? { status: options.status } : {}),
                ...(options.jobTitle ? { jobTitle: options.jobTitle } : {}),
                ...(options.jobType ? { jobType: options.jobType } : {}),
                ...(dateFilter ?? {}),
            },
            include: {
                location: true,
                shiftTemplate: true,
                responses: {
                    include: {
                        companyUser: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
            orderBy: { dutyDate: 'asc' },
        });
    }

    async respond(shiftAdvertId: number, dto: RespondShiftAdvertDto) {
        const advert = await this.prisma.shiftAdvert.findUnique({
            where: { id: shiftAdvertId },
            select: { id: true, status: true },
        });

        if (!advert) {
            throw new NotFoundException('Shift advert not found.');
        }

        if (advert.status !== ShiftAdvertStatus.OPEN) {
            throw new BadRequestException('Shift advert is not open.');
        }

        return this.prisma.shiftAdvertResponse.upsert({
            where: {
                shiftAdvertId_companyUserId: {
                    shiftAdvertId,
                    companyUserId: dto.companyUserId,
                },
            },
            create: {
                shiftAdvertId,
                companyUserId: dto.companyUserId,
                response: dto.response,
            },
            update: {
                response: dto.response,
                respondedAt: new Date(),
            },
        });
    }

    async accept(shiftAdvertId: number, dto: AcceptShiftAdvertDto) {
        const advert = await this.prisma.shiftAdvert.findUnique({
            where: { id: shiftAdvertId },
            include: { roster: true },
        });

        if (!advert) {
            throw new NotFoundException('Shift advert not found.');
        }

        if (advert.status !== ShiftAdvertStatus.OPEN) {
            throw new BadRequestException('Shift advert is not open.');
        }

        if (advert.roster) {
            throw new BadRequestException('Shift advert already assigned.');
        }

        const response = await this.prisma.shiftAdvertResponse.findUnique({
            where: {
                shiftAdvertId_companyUserId: {
                    shiftAdvertId,
                    companyUserId: dto.companyUserId,
                },
            },
        });

        if (!response) {
            throw new NotFoundException('Response not found for this advert.');
        }

        if (response.response !== ShiftAdvertResponseStatus.WILLING) {
            throw new BadRequestException('User did not accept this shift.');
        }

        const shiftTemplate = await this.prisma.shiftTemplate.findUnique({
            where: { id: advert.shiftTemplateId },
            select: { startTime: true, endTime: true, breakMinutes: true },
        });

        const scheduledMinutes = shiftTemplate
            ? this.calculateScheduledMinutes(
                shiftTemplate.startTime,
                shiftTemplate.endTime,
                shiftTemplate.breakMinutes,
            )
            : undefined;

        return this.prisma.$transaction(async (tx) => {
            const roster = await tx.roster.create({
                data: {
                    companyId: advert.companyId,
                    companyUserId: dto.companyUserId,
                    locationId: advert.locationId,
                    shiftTemplateId: advert.shiftTemplateId,
                    dutyDate: advert.dutyDate,
                    shiftAdvertId: advert.id,
                    ...(scheduledMinutes !== undefined ? { scheduledMinutes } : {}),
                },
            });

            await tx.shiftAdvert.update({
                where: { id: advert.id },
                data: { status: ShiftAdvertStatus.CLOSED },
            });

            await tx.shiftAdvertResponse.update({
                where: { id: response.id },
                data: { rosterId: roster.id },
            });

            const companyUser = await tx.companyUser.findUnique({
                where: { id: dto.companyUserId },
                select: { userId: true },
            });

            if (companyUser) {
                const dutyDate = advert.dutyDate.toISOString().split('T')[0];
                await tx.notification.create({
                    data: {
                        userId: companyUser.userId,
                        title: 'Shift assigned',
                        message: `You are assigned for ${advert.jobTitle} on ${dutyDate}.`,
                    },
                });
            }

            return roster;
        });
    }

    async cancelAdvert(shiftAdvertId: number) {
        const advert = await this.prisma.shiftAdvert.findUnique({
            where: { id: shiftAdvertId },
        });

        if (!advert) {
            throw new NotFoundException('Shift advert not found.');
        }

        if (advert.status !== ShiftAdvertStatus.OPEN) {
            throw new BadRequestException('Can only cancel open shift adverts.');
        }

        return this.prisma.shiftAdvert.update({
            where: { id: shiftAdvertId },
            data: { status: ShiftAdvertStatus.CANCELLED },
        });
    }

    async closeAdvert(shiftAdvertId: number) {
        const advert = await this.prisma.shiftAdvert.findUnique({
            where: { id: shiftAdvertId },
        });

        if (!advert) {
            throw new NotFoundException('Shift advert not found.');
        }

        if (advert.status !== ShiftAdvertStatus.OPEN) {
            throw new BadRequestException('Can only close open shift adverts.');
        }

        return this.prisma.shiftAdvert.update({
            where: { id: shiftAdvertId },
            data: { status: ShiftAdvertStatus.CLOSED },
        });
    }

    async getResponses(shiftAdvertId: number) {
        const advert = await this.prisma.shiftAdvert.findUnique({
            where: { id: shiftAdvertId },
        });

        if (!advert) {
            throw new NotFoundException('Shift advert not found.');
        }

        return this.prisma.shiftAdvertResponse.findMany({
            where: { shiftAdvertId },
            include: {
                companyUser: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: { respondedAt: 'desc' },
        });
    }

    async getWillingResponses(shiftAdvertId: number) {
        return this.prisma.shiftAdvertResponse.findMany({
            where: {
                shiftAdvertId,
                response: ShiftAdvertResponseStatus.WILLING,
            },
            include: {
                companyUser: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: { respondedAt: 'asc' },
        });
    }

    async findByLocation(locationId: number, from?: Date, to?: Date) {
        const dateFilter = this.buildDateRangeFilter(from, to);
        return this.prisma.shiftAdvert.findMany({
            where: {
                locationId,
                ...(dateFilter ?? {}),
            },
            include: {
                location: true,
                shiftTemplate: true,
                responses: {
                    include: {
                        companyUser: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
            orderBy: { dutyDate: 'asc' },
        });
    }
}
