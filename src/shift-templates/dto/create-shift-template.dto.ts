import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShiftTemplateDto {
  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsInt()
  @IsOptional()
  breakMinutes?: number;
}
