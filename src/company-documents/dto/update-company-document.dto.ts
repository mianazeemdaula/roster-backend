import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDocumentDto } from './create-company-document.dto';

export class UpdateCompanyDocumentDto extends PartialType(
    CreateCompanyDocumentDto,
) { }
