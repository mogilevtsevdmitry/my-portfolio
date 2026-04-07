'use client';

import {
  useState, useEffect, useLayoutEffect, useRef, useCallback,
  Children,
} from 'react';

interface FullPageScrollProps {
  children: React.ReactNode;
  sectionLabels?: string[];
}

const DURATION = 900;
const COOLDOWN = 1300;

export function FullPageScroll({ children, sectionLabels = [] }: FullPageScrollProps) {
  const slides = Children.toArray(children);
  const total = slides.length;

  const [current, setCurrent] = useState(0);
  const [displayCurrent, setDisplayCurrent] = useState(0);
  const [noTransition, setNoTransition] = useState(true);

  const currentRef     = useRef(0);
  const isAnimatingRef = useRef(false);
  const lastNavTimeRef = useRef(0);
  const slideRefs      = useRef<(HTMLDivElement | null)[]>([]);

  /* ── navigate ── */
  const goTo = useCallback((index: number, force = false) => {
    if (index < 0 || index >= total) return;
    if (!force && isAnimatingRef.current) return;
    const now = Date.now();
    if (!force && now - lastNavTimeRef.current < COOLDOWN) return;

    lastNavTimeRef.current = now;
    const target = slideRefs.current[index];
    if (target) target.scrollTop = 0;

    isAnimatingRef.current = true;
    currentRef.current = index;
    setCurrent(index);
    setTimeout(() => {
      setDisplayCurrent(index);
      isAnimatingRef.current = false;
    }, DURATION);
  }, [total]);

  /* ── mount: jump to hash without animation ── */
  useLayoutEffect(() => {
    const hash = window.location.hash.slice(1);

    if (hash) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;

      const idx = slideRefs.current.findIndex(
        (slide) => slide?.querySelector(`[id="${hash}"]`) !== null,
      );

      if (idx !== -1) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        currentRef.current = idx;
        setCurrent(idx);
        setDisplayCurrent(idx);
        const target = slideRefs.current[idx];
        if (target) target.scrollTop = 0;
      }
    }

    requestAnimationFrame(() => setNoTransition(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── same-page hash nav (navbar clicks while on home) ── */
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;

      history.replaceState(null, '', window.location.pathname + window.location.search);
      window.scrollTo(0, 0);

      requestAnimationFrame(() => {
        const idx = slideRefs.current.findIndex(
          (slide) => slide?.querySelector(`[id="${hash}"]`) !== null,
        );
        if (idx !== -1 && idx !== currentRef.current) {
          isAnimatingRef.current = false;
          lastNavTimeRef.current = 0;
          goTo(idx, true);
        }
      });
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [goTo]);

  /* ── wheel ── */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const slide = slideRefs.current[currentRef.current];
      if (!slide) return;

      const atBottom = slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 4;
      const atTop    = slide.scrollTop <= 0;

      if (e.deltaY > 0 && !atBottom) return;
      if (e.deltaY < 0 && !atTop)    return;
      if (Math.abs(e.deltaY) < 8)    return;

      e.preventDefault();
      if (e.deltaY > 0) goTo(currentRef.current + 1);
      else              goTo(currentRef.current - 1);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [goTo]);

  /* ── touch swipe ── */
  useEffect(() => {
    let startY = 0;
    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onEnd   = (e: TouchEvent) => {
      const diff = startY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 60) return;
      if (diff > 0) goTo(currentRef.current + 1);
      else          goTo(currentRef.current - 1);
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend',   onEnd);
    };
  }, [goTo]);

  /* ── keyboard ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(e.key)) return;
      e.preventDefault();
      if (['ArrowDown', 'PageDown'].includes(e.key)) goTo(currentRef.current + 1);
      else                                            goTo(currentRef.current - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo]);

  const pct = ((displayCurrent + 1) / total * 100).toFixed(0);

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 25,
          background: 'var(--bg-primary)',
        }}
      >
        <div
          style={{
            transform: `translateY(-${current * 100}vh)`,
            transition: noTransition ? 'none' : `transform ${DURATION}ms cubic-bezier(0.86, 0, 0.07, 1)`,
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              ref={el => { slideRefs.current[i] = el; }}
              style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* ── Dot navigation ── */}
      <div
        style={{
          position: 'fixed', right: '1.5rem', top: '50%',
          transform: 'translateY(-50%)', zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, true)}
            aria-label={sectionLabels[i] ?? `Section ${i + 1}`}
            title={sectionLabels[i]}
            style={{
              width:      i === displayCurrent ? '6px'  : '5px',
              height:     i === displayCurrent ? '22px' : '5px',
              borderRadius: '4px',
              background: i === displayCurrent
                ? 'var(--accent)'
                : 'rgba(201,168,76,0.25)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: i === displayCurrent ? '0 0 8px var(--accent-glow-strong)' : 'none',
            }}
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, height: '2px', background: 'var(--border)' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--accent-dark), var(--accent))',
          transition: `width ${DURATION}ms cubic-bezier(0.86,0,0.07,1)`,
        }} />
      </div>

      {/* ── Section counter ── */}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200,
        fontFamily: 'var(--font-syne)', fontSize: '0.6rem', fontWeight: 700,
        letterSpacing: '0.15em', color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span style={{ color: 'var(--accent)' }}>{String(displayCurrent + 1).padStart(2, '0')}</span>
        <span style={{ color: 'var(--border-hover)' }}>/</span>
        <span>{String(total).padStart(2, '0')}</span>
      </div>
    </>
  );
}
