import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CompanyRole } from '@prisma/client';

export class CreateCompanyUserDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @IsEnum(CompanyRole)
  @IsNotEmpty()
  role: CompanyRole;

  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isRequested?: boolean;
}
