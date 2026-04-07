'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import clsx from 'clsx';
import type { Locale } from '@/i18n';

interface NavbarProps { locale: Locale; }

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('common');
  const currentPath = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '/#about',    label: t('nav.about') },
    { href: '/#projects', label: t('nav.projects') },
    { href: '/#tech',     label: t('nav.tech') },
    { href: '/blog',      label: t('nav.blog') },
    { href: '/#contacts', label: t('nav.contacts') },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith('/#') && currentPath === '/') {
      e.preventDefault();
      window.location.hash = href.slice(2);
    }
  };

  const switchLocale = () => {
    router.replace(currentPath, { locale: locale === 'ru' ? 'en' : 'ru' });
  };

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'border-b'
          : 'bg-transparent',
      )}
      style={scrolled ? {
        background: 'rgba(9,9,10,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--border)',
      } : {}}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-16 h-16 md:h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 relative overflow-hidden"
            style={{ filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.4))' }}
          >
            <Image
              src="/logo.png"
              alt="DM Logo"
              fill
              priority
              className="object-contain transition-all duration-300 group-hover:drop-shadow-lg"
              sizes="40px"
            />
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              className="relative text-xs tracking-widest uppercase transition-colors duration-200"
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-light)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={switchLocale}
            className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
            }}
            aria-label="Switch language"
          >
            {locale === 'ru' ? 'EN' : 'RU'}
          </button>

          {/* Burger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className={clsx('h-px w-6 transition-all duration-300',
              open ? 'rotate-45 translate-y-2' : '')}
              style={{ background: 'var(--accent)' }}
            />
            <span className={clsx('h-px w-4 transition-all duration-300',
              open ? 'opacity-0 w-0' : '')}
              style={{ background: 'var(--text-muted)' }}
            />
            <span className={clsx('h-px w-6 transition-all duration-300',
              open ? '-rotate-45 -translate-y-2' : '')}
              style={{ background: 'var(--accent)' }}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={clsx(
          'md:hidden overflow-hidden transition-all duration-400',
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
        style={{ background: 'rgba(9,9,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: open ? '1px solid var(--border)' : 'none' }}
      >
        <div className="px-6 py-6 flex flex-col gap-5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={(e) => { handleNavClick(e, href); setOpen(false); }}
              className="text-sm py-1 transition-colors duration-200"
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
