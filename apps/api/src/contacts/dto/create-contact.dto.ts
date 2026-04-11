import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsString()
  @Matches(/^([^\s@]+@[^\s@]+\.[^\s@]+|@[a-zA-Z0-9_]{4,32})$/, {
    message: 'contact must be a valid email or Telegram handle starting with @',
  })
  contact: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @IsString()
  captchaToken: string;

  @Type(() => Number)
  @IsInt()
  captchaAnswer: number;

  /**
   * Honeypot field — real users don't see it, bots fill it.
   * Must be empty / undefined. Any value → request rejected.
   */
  @IsOptional()
  @IsString()
  @MaxLength(0, { message: 'spam detected' })
  website?: string;
}
