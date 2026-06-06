import {
  IsString,
  IsOptional,
  IsObject,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  MaxLength,
} from 'class-validator';
import {
  MAX_PAYLOAD_BYTES,
  MAX_PAYLOAD_KEYS,
  isWithinPayloadBounds,
} from './payload-bounds';

export { MAX_PAYLOAD_BYTES, MAX_PAYLOAD_KEYS, isWithinPayloadBounds };

/**
 * Custom validator that caps the size and shape of the analytics `payload`
 * object: a flat-ish record with a bounded number of keys and a bounded
 * serialized byte size. Prevents a client from shipping a huge/deeply-nested
 * blob that bloats the DB row (SEC-012). Works together with the global 64kb
 * body limit set in main.ts. The bounds live in `payload-bounds.ts` so the
 * service-layer guard reuses the exact same logic.
 */
@ValidatorConstraint({ name: 'boundedPayload', async: false })
export class BoundedPayloadConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isWithinPayloadBounds(value);
  }

  defaultMessage(): string {
    return `payload must be an object with at most ${MAX_PAYLOAD_KEYS} keys and ${MAX_PAYLOAD_BYTES} bytes when serialized`;
  }
}

export class CreateEventDto {
  @IsString()
  @MaxLength(80)
  event: string;

  // The DB column is `Json?` (Prisma) and the service writes the payload
  // verbatim, so the runtime contract is an arbitrary JSON-serializable object,
  // not strictly string-valued. The type reflects that; bounds are enforced by
  // BoundedPayloadConstraint (SEC-012).
  @IsOptional()
  @IsObject()
  @Validate(BoundedPayloadConstraint)
  payload?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  sessionId?: string;
}
