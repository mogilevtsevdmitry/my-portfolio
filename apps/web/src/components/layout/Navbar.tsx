'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import clsx from 'clsx';
import type { Locale } from '@/i18n';

interface NavbarProps {
  locale: Locale;
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('common');
  const currentPath = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '#about', label: t('nav.about') },
    { href: '#projects', label: t('nav.projects') },
    { href: '#tech', label: t('nav.tech') },
    { href: '/blog', label: t('nav.blog') },
    { href: '#contacts', label: t('nav.contacts') },
  ];

  const switchLocale = () => {
    router.replace(currentPath, { locale: locale === 'ru' ? 'en' : 'ru' });
  };

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border)]'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-accent font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          DM
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <button
            onClick={switchLocale}
            className="text-sm text-[var(--text-muted)] hover:text-accent transition-colors px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--border-hover)]"
            aria-label="Switch language"
          >
            {locale === 'ru' ? 'EN' : 'RU'}
          </button>

          {/* Burger (mobile) */}
          <button
            className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="sr-only">Menu</span>
            <div className="w-5 flex flex-col gap-1">
              <span
                className={clsx(
                  'h-0.5 bg-current transition-all',
                  open && 'rotate-45 translate-y-1.5',
                )}
              />
              <span
                className={clsx('h-0.5 bg-current transition-all', open && 'opacity-0')}
              />
              <span
                className={clsx(
                  'h-0.5 bg-current transition-all',
                  open && '-rotate-45 -translate-y-1.5',
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[var(--bg-secondary)] border-b border-[var(--border)] px-4 py-4 flex flex-col gap-4">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-2"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
