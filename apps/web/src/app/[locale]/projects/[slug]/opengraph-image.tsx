import { ImageResponse } from 'next/og';
import { fetchProjectBySlug, getProjectTranslation } from '@/lib/projects';

export const alt = 'Project';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const project = await fetchProjectBySlug(slug);
  const content = project ? getProjectTranslation(project, locale) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          background: 'linear-gradient(135deg, #0B1F1A 0%, #0F2A24 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ color: '#4ADE80', fontSize: 18, marginBottom: 20 }}>
          Dmitry Mogilevtsev
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#F0FDF4',
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          {content?.title ?? slug}
        </div>
        <div style={{ fontSize: 22, color: '#86EFAC', maxWidth: 700 }}>
          {content?.shortDescription ?? ''}
        </div>
        {project?.technologies && project.technologies.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            {project.technologies.slice(0, 5).map((tech) => (
              <span
                key={tech}
                style={{
                  padding: '6px 14px',
                  background: 'rgba(74,222,128,0.15)',
                  border: '1px solid rgba(74,222,128,0.3)',
                  borderRadius: 20,
                  color: '#4ADE80',
                  fontSize: 14,
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    ),
    size,
  );
}
