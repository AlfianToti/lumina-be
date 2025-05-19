import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsMongoId,
  IsArray,
} from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  permissions: string[];

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;
}
