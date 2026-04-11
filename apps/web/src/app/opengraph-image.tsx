import { ImageResponse } from 'next/og';

export const alt = 'Dmitry Mogilevtsev — Fullstack Engineer & AI Product Architect';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Root-level OG image. Served at `/opengraph-image` so Telegram / Twitter /
 * Facebook scrapers get a valid og:image even when they hit the bare domain
 * before next-intl's middleware redirects them to `/ru` or `/en`.
 *
 * Same layout as the locale-specific version in `[locale]/opengraph-image.tsx`
 * but without calling `getTranslations` (which requires a locale context).
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 36,
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
              fontSize: 20,
              letterSpacing: 4,
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Fullstack × AI × Entrepreneur
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              color: '#F5EFE2',
              fontSize: 130,
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            Dmitry
          </div>
          <div
            style={{
              color: '#E4C87A',
              fontSize: 130,
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: -2,
              marginTop: 6,
            }}
          >
            Mogilevtsev
          </div>
        </div>

        <div
          style={{
            height: 2,
            width: 220,
            background: 'linear-gradient(90deg, #C9A84C 0%, transparent 100%)',
            marginBottom: 24,
          }}
        />

        <div
          style={{
            color: '#B5A88A',
            fontSize: 30,
            letterSpacing: 2,
            fontWeight: 600,
          }}
        >
          Fullstack · AI · SaaS
        </div>

        <div
          style={{
            position: 'absolute',
            right: 80,
            bottom: 60,
            color: '#7C7060',
            fontSize: 20,
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
