import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { ShiftAdvertResponseStatus } from '@prisma/client';

export class RespondShiftAdvertDto {
    @IsInt()
    @IsNotEmpty()
    companyUserId: number;

    @IsEnum(ShiftAdvertResponseStatus)
    response: ShiftAdvertResponseStatus;
}
