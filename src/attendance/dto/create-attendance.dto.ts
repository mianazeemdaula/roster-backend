import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAttendanceDto {
  @IsInt()
  @IsNotEmpty()
  rosterId: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  checkInTime?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  checkOutTime?: Date;

  @IsNumber()
  @IsOptional()
  checkInLat?: number;

  @IsNumber()
  @IsOptional()
  checkInLng?: number;

  @IsString()
  @IsOptional()
  checkInPhoto?: string;

  @IsString()
  @IsOptional()
  checkOutPhoto?: string;
}
