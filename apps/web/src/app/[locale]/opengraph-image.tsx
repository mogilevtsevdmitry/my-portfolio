import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

export const alt = 'Dmitry Mogilevtsev — Fullstack Engineer & AI Product Architect';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          // Dark base + two soft gold ambient glows, matching the site's Aurora.
          background:
            'radial-gradient(ellipse 60% 45% at 85% 20%, rgba(201,168,76,0.22), transparent 65%), ' +
            'radial-gradient(ellipse 55% 50% at 15% 85%, rgba(120,90,30,0.35), transparent 60%), ' +
            '#09090A',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top bar: label */}
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
            {label}
          </div>
        </div>

        {/* Name — serif-style via heavy weight */}
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
            {firstName}
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
            {lastName}
          </div>
        </div>

        {/* Gold divider */}
        <div
          style={{
            height: 2,
            width: 220,
            background: 'linear-gradient(90deg, #C9A84C 0%, transparent 100%)',
            marginBottom: 24,
          }}
        />

        {/* Specialization line */}
        <div
          style={{
            color: '#B5A88A',
            fontSize: 30,
            letterSpacing: 2,
            fontWeight: 600,
          }}
        >
          {specializationLine}
        </div>

        {/* Bottom-right: site URL */}
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
