import { IsInt, IsNotEmpty } from 'class-validator';

export class LeaveCompanyDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsInt()
    @IsNotEmpty()
    companyId: number;
}
