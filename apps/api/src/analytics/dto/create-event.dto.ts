import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateEventDto {
  @IsString()
  event: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, string>;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
