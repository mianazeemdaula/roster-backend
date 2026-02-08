import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { JobType } from '@prisma/client';

export class CreateShiftAdvertDto {
    @IsInt()
    @IsNotEmpty()
    companyId: number;

    @IsInt()
    @IsNotEmpty()
    locationId: number;

    @IsInt()
    @IsNotEmpty()
    shiftTemplateId: number;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    dutyDate: Date;

    @IsString()
    @IsNotEmpty()
    jobTitle: string;

    @IsEnum(JobType)
    @IsOptional()
    jobType?: JobType;

    @IsString()
    @IsOptional()
    note?: string;
}
