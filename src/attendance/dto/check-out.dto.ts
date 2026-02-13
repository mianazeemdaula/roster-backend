import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckOutDto {
    @IsInt()
    @IsNotEmpty()
    rosterId: number;

    @IsString()
    @IsOptional()
    checkOutPhoto?: string;
}
