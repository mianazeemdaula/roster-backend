import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminLeaveCompanyDto {
    @IsInt()
    @IsNotEmpty()
    adminUserId: number;

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
