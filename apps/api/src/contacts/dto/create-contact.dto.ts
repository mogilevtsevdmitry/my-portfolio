import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * Accepts any of:
 *   - Email:                          user@example.com
 *   - Telegram handle with @:         @mogilevtsevdmitry
 *   - Telegram handle without @:      mogilevtsevdmitry
 *   - Telegram URL:                   https://t.me/mogilevtsevdmitry, t.me/handle
 *   - Phone number (international):   +79001234567
 */
const CONTACT_REGEX =
  /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|(?:https?:\/\/)?(?:t\.me|telegram\.me)\/[a-zA-Z0-9_]{4,32}|@?[a-zA-Z0-9_]{4,32}|\+?[0-9\s\-()]{7,20})$/;

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(CONTACT_REGEX, {
    message: 'CONTACT_FORMAT',
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
   * Validated only for type/length (no business rule) so the service can
   * silently drop suspicious requests without revealing the check.
   */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  website?: string;
}
