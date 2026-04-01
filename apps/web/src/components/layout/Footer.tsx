export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-8 px-4 md:px-8 border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[var(--text-muted)]">
          © {year} Dmitry Mogilevtsev
        </p>
        <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
          <a
            href="https://t.me/your_handle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            Telegram
          </a>
          <a
            href="mailto:hello@dmitry.dev"
            className="hover:text-accent transition-colors"
          >
            Email
          </a>
          <a
            href="https://github.com/your-handle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
