import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsMongoId()
  role: string;

  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;
}
