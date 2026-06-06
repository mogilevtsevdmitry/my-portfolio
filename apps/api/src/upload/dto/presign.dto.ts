import { IsIn, IsString, Matches } from 'class-validator';

/**
 * Allowed upload MIME types (SEC-002).
 *
 * STRICT raster-image allowlist only. Deliberately EXCLUDES:
 *  - `image/svg+xml` — SVG can carry inline <script>/event handlers and is a
 *    stored-XSS vector when served with `public-read`.
 *  - any `text/*` or `application/*` — never a legitimate project/blog image.
 *
 * The MIME determines both the stored object's ContentType and the file
 * extension on the server side (see UploadService), so a client cannot smuggle
 * an arbitrary extension or content type via the filename.
 */
export const ALLOWED_UPLOAD_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
] as const;

export type AllowedUploadMime = (typeof ALLOWED_UPLOAD_MIME)[number];

/**
 * Max upload size contract: 10 MB (SEC-002).
 *
 * NOTE: a presigned S3 *PUT* URL cannot enforce a maximum size at sign time
 * (S3 ignores Content-Length-Range on PUT; that condition is a presigned-POST
 * policy feature). We therefore document the limit here as the contract the
 * admin client must respect and validate the filename/MIME strictly. If hard
 * server-side enforcement is later required, switch the presign flow to
 * `createPresignedPost` with a `content-length-range` condition.
 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export class PresignDto {
  /**
   * Original file name. Only used for human-readable validation — the stored
   * key is a UUID, so traversal/overwrite is already impossible. Restricted to
   * word chars, dot and dash, 1–120 chars.
   */
  @IsString()
  @Matches(/^[\w.\-]{1,120}$/, {
    message: 'fileName must be 1-120 chars of letters, digits, . _ or -',
  })
  fileName: string;

  @IsIn(ALLOWED_UPLOAD_MIME, {
    message: `contentType must be one of: ${ALLOWED_UPLOAD_MIME.join(', ')}`,
  })
  contentType: AllowedUploadMime;
}
