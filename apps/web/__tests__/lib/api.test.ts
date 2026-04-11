import { submitContact } from '@/lib/api';

global.fetch = jest.fn();

const basePayload = {
  name: 'Test User',
  contact: 'test@example.com',
  description: 'Hello from tests',
  captchaToken: 'signed.token',
  captchaAnswer: 7,
};

describe('submitContact', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it('should POST to /contacts with correct payload', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) });

    await submitContact(basePayload);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/contacts'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload),
      }),
    );
  });

  it('should throw on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad Request' }),
    });

    await expect(submitContact(basePayload)).rejects.toThrow();
  });
});
