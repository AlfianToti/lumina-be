import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsArray,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  cover: string;

  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  authors: string[];

  @IsNotEmpty()
  @IsMongoId()
  category: string;

  @IsNotEmpty()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;
}
