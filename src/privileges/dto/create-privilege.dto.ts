import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePrivilegeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;
}
