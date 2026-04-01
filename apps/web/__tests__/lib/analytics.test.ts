import { trackEvent, getSessionId } from '@/lib/analytics';

const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string): string | null => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('analytics', () => {
  beforeEach(() => {
    mockFetch.mockReset().mockResolvedValue({ ok: true });
    localStorageMock.clear();
  });

  describe('getSessionId', () => {
    it('should create and persist a UUID on first call', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const id1 = getSessionId();

      expect(id1).toBeDefined();
      expect(typeof id1).toBe('string');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('_sid', id1);
    });

    it('should return existing sessionId from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('existing-session-id');

      const id = getSessionId();
      expect(id).toBe('existing-session-id');
    });
  });

  describe('trackEvent', () => {
    it('should POST to /analytics/event with event and sessionId', async () => {
      localStorageMock.getItem.mockReturnValue('test-session');

      await trackEvent('hero_cta_click', { cta_type: 'discuss' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/analytics/event'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            event: 'hero_cta_click',
            payload: { cta_type: 'discuss' },
            sessionId: 'test-session',
          }),
        }),
      );
    });

    it('should not throw if fetch fails (fire-and-forget)', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        trackEvent('hero_cta_click'),
      ).resolves.not.toThrow();
    });
  });
});
