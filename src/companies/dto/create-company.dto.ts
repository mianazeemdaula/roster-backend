import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsInt()
  @IsNotEmpty()
  ownerId: number;

  @IsString()
  @IsNotEmpty()
  companyCode: string;
}
