import { IsString, MinLength, Matches } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @Matches(/^([^\s@]+@[^\s@]+\.[^\s@]+|@[a-zA-Z0-9_]{4,32})$/, {
    message: 'contact must be a valid email or Telegram handle starting with @',
  })
  contact: string;

  @IsString()
  @MinLength(10)
  description: string;
}
