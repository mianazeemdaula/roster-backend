import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { RosterStatus } from '@prisma/client';

export class CreateRosterDto {
  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @IsInt()
  @IsNotEmpty()
  companyUserId: number;

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

  @IsEnum(RosterStatus)
  @IsOptional()
  status?: RosterStatus;
}
