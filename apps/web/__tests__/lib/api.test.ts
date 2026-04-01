import { submitContact } from '@/lib/api';

global.fetch = jest.fn();

describe('submitContact', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it('should POST to /contacts with correct payload', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    await submitContact({
      name: 'Test User',
      contact: 'test@example.com',
      description: 'Hello from tests',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/contacts'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          contact: 'test@example.com',
          description: 'Hello from tests',
        }),
      }),
    );
  });

  it('should throw on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 400 });

    await expect(
      submitContact({ name: 'A', contact: 'b@c.com', description: 'test' }),
    ).rejects.toThrow();
  });
});
