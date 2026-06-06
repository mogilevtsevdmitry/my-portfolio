/**
 * SEC-012: shared bounds + guard for the free-form analytics `payload`.
 *
 * A single source of truth so the DTO validator (rejects with 400) and the
 * service-layer defense-in-depth check (drops the payload) can never drift
 * apart. See {@link isWithinPayloadBounds}.
 */

/** Maximum number of top-level keys allowed in an analytics payload. */
export const MAX_PAYLOAD_KEYS = 20;

/** Maximum serialized size, in UTF-8 bytes. */
export const MAX_PAYLOAD_BYTES = 4 * 1024; // 4 KB serialized

/**
 * Returns `true` when `payload` is a plain object within the SEC-012 bounds:
 * a flat-ish record with at most {@link MAX_PAYLOAD_KEYS} keys whose JSON
 * serialization is at most {@link MAX_PAYLOAD_BYTES} UTF-8 bytes.
 *
 * `undefined`/`null` are considered in-bounds (the field is optional).
 * Arrays, non-objects and non-serializable values (e.g. circular) are out of
 * bounds. The byte size is measured with `Buffer.byteLength(..., 'utf8')`, not
 * `String.length`, so multi-byte characters (Cyrillic, emoji) are counted
 * honestly rather than as UTF-16 code units.
 */
export function isWithinPayloadBounds(payload: unknown): boolean {
  if (payload === undefined || payload === null) return true;
  if (typeof payload !== 'object' || Array.isArray(payload)) return false;

  const keys = Object.keys(payload as Record<string, unknown>);
  if (keys.length > MAX_PAYLOAD_KEYS) return false;

  try {
    const serialized = JSON.stringify(payload);
    if (Buffer.byteLength(serialized, 'utf8') > MAX_PAYLOAD_BYTES) return false;
  } catch {
    // Non-serializable (e.g. circular) payloads are out of bounds.
    return false;
  }

  return true;
}
