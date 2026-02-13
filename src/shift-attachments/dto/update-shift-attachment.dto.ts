import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftAttachmentDto } from './create-shift-attachment.dto';

export class UpdateShiftAttachmentDto extends PartialType(
    CreateShiftAttachmentDto,
) { }
