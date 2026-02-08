import { IsInt, IsNotEmpty } from 'class-validator';

export class AcceptShiftAdvertDto {
    @IsInt()
    @IsNotEmpty()
    companyUserId: number;
}
