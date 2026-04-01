import { Type } from 'class-transformer';
import { Allow, IsArray, IsString, ValidateNested, IsIn } from 'class-validator';

class TranslationDto {
  @IsIn(['ru', 'en'])
  locale: string;

  @IsString()
  title: string;

  @IsString()
  excerpt: string;

  @Allow()
  content: unknown;
}

export class CreatePostDto {
  @IsString()
  slug: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationDto)
  translations: TranslationDto[];
}
