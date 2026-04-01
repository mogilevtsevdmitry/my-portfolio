import { IsIn } from 'class-validator';

export class UpdateContactStatusDto {
  @IsIn(['NEW', 'READ', 'ARCHIVED'])
  status: string;
}
