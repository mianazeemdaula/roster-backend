import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateShiftAttachmentDto {
    @IsInt()
    @IsNotEmpty()
    rosterId: number;

    @IsString()
    @IsNotEmpty()
    fileUrl: string;

    @IsString()
    @IsNotEmpty()
    fileType: string; // image, document, etc.
}
