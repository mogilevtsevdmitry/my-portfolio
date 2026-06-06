import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import {
  AllowedUploadMime,
  MAX_UPLOAD_BYTES,
} from './dto/presign.dto';

/**
 * Map an allowlisted MIME type to a safe file extension. Driving the extension
 * from the (validated) contentType — not the user-supplied fileName — prevents
 * a client from smuggling an arbitrary/dangerous extension onto the object.
 */
const MIME_TO_EXT: Record<AllowedUploadMime, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket: string;
  private endpoint: string;

  constructor(private config: ConfigService) {
    const region = config.get<string>('AWS_REGION', 'us-east-1');
    this.bucket = config.get<string>('AWS_S3_BUCKET', '');
    this.endpoint = config.get<string>('AWS_ENDPOINT', '');

    const s3Config: ConstructorParameters<typeof S3Client>[0] = {
      region,
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    };

    if (this.endpoint) {
      s3Config.endpoint = this.endpoint;
      s3Config.forcePathStyle = true;
    }

    this.s3 = new S3Client(s3Config);
  }

  async getPresignedUrl(
    _fileName: string,
    contentType: AllowedUploadMime,
  ): Promise<{ uploadUrl: string; fileUrl: string; maxBytes: number }> {
    // SEC-002: extension comes from the validated MIME, never from fileName.
    const ext = MIME_TO_EXT[contentType];
    // UUID key removes any traversal/overwrite risk regardless of fileName.
    const key = `projects/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      // ContentType is pinned to the server-validated allowlist value, so the
      // object cannot be served as text/html or SVG even if the client lies on
      // the actual PUT (S3 binds ContentType into the signed request).
      ContentType: contentType,
      // ACL kept public-read on purpose: project/blog preview images are served
      // publicly by the site. Safety here comes from the strict image-only MIME
      // allowlist + server-pinned ContentType, NOT from object privacy. Do not
      // remove — it would break production image rendering.
      ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const fileUrl = this.endpoint
      ? `${this.endpoint}/${this.bucket}/${key}`
      : `https://${this.bucket}.s3.${this.config.get('AWS_REGION', 'us-east-1')}.amazonaws.com/${key}`;

    // maxBytes is the size contract the admin client must enforce before PUT.
    // A presigned PUT URL cannot itself cap size (see PresignDto docs); if hard
    // enforcement becomes necessary, migrate to createPresignedPost with a
    // content-length-range condition.
    return { uploadUrl, fileUrl, maxBytes: MAX_UPLOAD_BYTES };
  }
}
