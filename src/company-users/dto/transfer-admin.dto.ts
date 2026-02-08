import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TransferAdminDto {
    @IsInt()
    @IsNotEmpty()
    currentAdminUserId: number;

    @IsInt()
    @IsNotEmpty()
    newAdminUserId: number;

    @IsInt()
    @IsNotEmpty()
    companyId: number;

    @IsString()
    @IsOptional()
    reason?: string;
}
