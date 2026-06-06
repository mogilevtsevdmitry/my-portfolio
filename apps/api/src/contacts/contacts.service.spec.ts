import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './notifications/telegram.service';
import { EmailService } from './notifications/email.service';
import { CaptchaService } from './captcha.service';
import { CreateContactDto } from './dto/create-contact.dto';

describe('ContactsService', () => {
  let service: ContactsService;
  let prisma: any;
  let telegram: any;
  let email: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: PrismaService,
          useValue: {
            contact: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: TelegramService,
          useValue: { sendMessage: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: EmailService,
          useValue: {
            sendContactNotification: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: CaptchaService,
          useValue: { verify: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    prisma = module.get(PrismaService);
    telegram = module.get(TelegramService);
    email = module.get(EmailService);
  });

  describe('create', () => {
    it('should save contact and fire notifications', async () => {
      const dto: CreateContactDto = {
        name: 'Ivan',
        contact: 'ivan@example.com',
        description: 'I need help with my AI project',
        captchaToken: 'token',
        captchaAnswer: 42,
      };

      prisma.contact.create.mockResolvedValue({
        id: 'c-1',
        ...dto,
        status: 'NEW',
        createdAt: new Date(),
      } as any);

      const result = await service.create(dto);

      expect(result.id).toBe('c-1');
      expect(prisma.contact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'Ivan' }),
      });
      // notifications are fire-and-forget, give event loop a tick
      await new Promise((r) => setTimeout(r, 10));
      expect(telegram.sendMessage).toHaveBeenCalledTimes(1);
      expect(email.sendContactNotification).toHaveBeenCalledTimes(1);
    });
  });
});
