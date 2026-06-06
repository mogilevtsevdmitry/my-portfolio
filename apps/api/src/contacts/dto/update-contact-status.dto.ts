import { IsIn } from 'class-validator';
import { ContactStatus } from '../../generated/prisma/client';

const CONTACT_STATUSES: ContactStatus[] = [
  ContactStatus.NEW,
  ContactStatus.READ,
  ContactStatus.ARCHIVED,
];

export class UpdateContactStatusDto {
  // SEC-018: typed against the Prisma ContactStatus enum so the value flows to
  // the service without an `any` cast, while @IsIn keeps runtime validation.
  @IsIn(CONTACT_STATUSES)
  status: ContactStatus;
}
