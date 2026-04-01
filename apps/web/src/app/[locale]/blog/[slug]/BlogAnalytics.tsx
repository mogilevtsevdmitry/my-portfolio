'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function BlogAnalytics({ slug }: { slug: string }) {
  useEffect(() => {
    trackEvent('blog_post_view', { slug });
  }, [slug]);

  return null;
}
