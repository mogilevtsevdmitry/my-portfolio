import {
  MAX_PAYLOAD_BYTES,
  MAX_PAYLOAD_KEYS,
  isWithinPayloadBounds,
} from './payload-bounds';

describe('isWithinPayloadBounds (SEC-012)', () => {
  it('treats undefined/null as in-bounds (payload is optional)', () => {
    expect(isWithinPayloadBounds(undefined)).toBe(true);
    expect(isWithinPayloadBounds(null)).toBe(true);
  });

  it('accepts a small plain object', () => {
    expect(isWithinPayloadBounds({ a: '1', b: 'two' })).toBe(true);
  });

  it('rejects arrays and non-objects', () => {
    expect(isWithinPayloadBounds(['a', 'b'])).toBe(false);
    expect(isWithinPayloadBounds('a string')).toBe(false);
    expect(isWithinPayloadBounds(42)).toBe(false);
  });

  it('accepts non-string primitive/nested values (runtime is JSON, not strict strings)', () => {
    expect(isWithinPayloadBounds({ x: 123, y: true })).toBe(true);
    expect(isWithinPayloadBounds({ nested: { a: 1 } })).toBe(true);
  });

  it('rejects more than MAX_PAYLOAD_KEYS keys', () => {
    const tooMany: Record<string, string> = {};
    for (let i = 0; i <= MAX_PAYLOAD_KEYS; i++) tooMany[`k${i}`] = 'v';
    expect(Object.keys(tooMany).length).toBeGreaterThan(MAX_PAYLOAD_KEYS);
    expect(isWithinPayloadBounds(tooMany)).toBe(false);
  });

  it('accepts exactly MAX_PAYLOAD_KEYS keys', () => {
    const exact: Record<string, string> = {};
    for (let i = 0; i < MAX_PAYLOAD_KEYS; i++) exact[`k${i}`] = 'v';
    expect(Object.keys(exact).length).toBe(MAX_PAYLOAD_KEYS);
    expect(isWithinPayloadBounds(exact)).toBe(true);
  });

  it('rejects payloads over MAX_PAYLOAD_BYTES', () => {
    const big = { data: 'a'.repeat(MAX_PAYLOAD_BYTES) };
    expect(isWithinPayloadBounds(big)).toBe(false);
  });

  it('measures UTF-8 bytes, not UTF-16 code units (MN2)', () => {
    // Each Cyrillic char is 2 bytes in UTF-8 but 1 UTF-16 code unit.
    // Build a value whose .length is under the limit but whose byte size is over.
    const halfPlusOne = Math.floor(MAX_PAYLOAD_BYTES / 2) + 1;
    const cyrillic = 'я'.repeat(halfPlusOne);
    const payload = { data: cyrillic };

    // Sanity: the naive UTF-16 length-based check would have passed...
    expect(JSON.stringify(payload).length).toBeLessThanOrEqual(
      MAX_PAYLOAD_BYTES,
    );
    // ...but the honest UTF-8 byte count exceeds the bound, so we reject.
    expect(Buffer.byteLength(JSON.stringify(payload), 'utf8')).toBeGreaterThan(
      MAX_PAYLOAD_BYTES,
    );
    expect(isWithinPayloadBounds(payload)).toBe(false);
  });

  it('rejects non-serializable (circular) payloads', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(isWithinPayloadBounds(circular)).toBe(false);
  });
});
