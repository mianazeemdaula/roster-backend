import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckInDto {
    @IsInt()
    @IsNotEmpty()
    rosterId: number;

    @IsNumber()
    @IsOptional()
    checkInLat?: number;

    @IsNumber()
    @IsOptional()
    checkInLng?: number;

    @IsString()
    @IsOptional()
    checkInPhoto?: string;
}
