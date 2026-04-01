export type ContactStatus = 'NEW' | 'READ' | 'ARCHIVED';

export interface Contact {
  id: string;
  name: string;
  contact: string;
  description: string;
  status: ContactStatus;
  createdAt: string;
}

export interface CreateContactDto {
  name: string;
  contact: string; // email or @telegram_handle
  description: string;
}

export interface UpdateContactStatusDto {
  status: ContactStatus;
}
