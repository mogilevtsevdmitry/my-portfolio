import { Link } from '@/navigation';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Section className="min-h-screen flex items-center justify-center text-center">
      <div>
        <GlowText as="h1" className="text-8xl font-bold mb-4">404</GlowText>
        <p className="text-[var(--text-muted)] mb-8">Страница не найдена</p>
        <Link href="/">
          <Button>На главную</Button>
        </Link>
      </div>
    </Section>
  );
}
