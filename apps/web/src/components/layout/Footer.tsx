"use client";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="py-10 px-6 md:px-16 lg:px-24"
      style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <p
          className="text-xs"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-syne)', letterSpacing: '0.1em' }}
        >
          © {year} Dmitry Mogilevtsev
        </p>
        <div className="flex items-center gap-6">
          {[
            { label: 'Telegram', href: 'https://t.me/mogilevtsevdmitry' },
            { label: 'Email',    href: 'mailto:webmogilevtsev@ya.ru' },
            { label: 'GitHub',   href: 'https://github.com/mogilevtsevdmitry' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-xs transition-colors duration-200"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-syne)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
