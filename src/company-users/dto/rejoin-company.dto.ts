import { IsInt, IsNotEmpty } from 'class-validator';

export class RejoinCompanyDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsInt()
    @IsNotEmpty()
    companyId: number;
}
