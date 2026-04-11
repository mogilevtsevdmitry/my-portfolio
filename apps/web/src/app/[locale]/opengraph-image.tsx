import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { loadOgPhotoDataUrl } from '@/lib/og-photo';

export const alt = 'Dmitry Mogilevtsev — Fullstack Engineer & AI Product Architect';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const photoDataUrl = loadOgPhotoDataUrl();

export default async function Image({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'hero' });
  const firstName = t('firstName');
  const lastName = t('lastName');
  const label = t('label');
  const specializationLine = t('specializationLine');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          // Two columns: text on the left, portrait on the right.
          flexDirection: 'row',
          alignItems: 'center',
          padding: '70px 80px',
          // Satori (the engine behind @vercel/og) doesn't parse the mixed
          // `background:` shorthand — split color and gradients into their own
          // longhand properties.
          backgroundColor: '#09090A',
          backgroundImage:
            'radial-gradient(circle at 85% 20%, rgba(201,168,76,0.25), transparent 60%), ' +
            'radial-gradient(circle at 15% 85%, rgba(120,90,30,0.40), transparent 55%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* ────────── Left column: text ────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            paddingRight: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: '#C9A84C',
                boxShadow: '0 0 14px #C9A84C',
              }}
            />
            <div
              style={{
                color: '#C9A84C',
                fontSize: 18,
                letterSpacing: 4,
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                color: '#F5EFE2',
                fontSize: 104,
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: -2,
              }}
            >
              {firstName}
            </div>
            <div
              style={{
                color: '#E4C87A',
                fontSize: 104,
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: -2,
                marginTop: 6,
              }}
            >
              {lastName}
            </div>
          </div>

          <div
            style={{
              height: 2,
              width: 180,
              background: 'linear-gradient(90deg, #C9A84C 0%, transparent 100%)',
              marginBottom: 20,
            }}
          />

          <div
            style={{
              color: '#B5A88A',
              fontSize: 26,
              letterSpacing: 2,
              fontWeight: 600,
            }}
          >
            {specializationLine}
          </div>
        </div>

        {/* ────────── Right column: portrait ────────── */}
        <div
          style={{
            display: 'flex',
            position: 'relative',
            width: 340,
            height: 490,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: -12,
              border: '1px solid rgba(201, 168, 76, 0.28)',
              borderRadius: 24,
            }}
          />
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(201, 168, 76, 0.15)',
              position: 'relative',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoDataUrl}
              alt=""
              width={340}
              height={490}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 80,
            bottom: 50,
            color: '#7C7060',
            fontSize: 18,
            letterSpacing: 3,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          webmogilevtsev.ru
        </div>
      </div>
    ),
    size,
  );
}
