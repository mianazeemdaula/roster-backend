import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCompanyDocumentDto {
    @IsInt()
    @IsNotEmpty()
    companyId: number;

    @IsString()
    @IsNotEmpty()
    docType: string; // e.g., "business_license", "tax_certificate"

    @IsString()
    @IsNotEmpty()
    docUrl: string;
}
