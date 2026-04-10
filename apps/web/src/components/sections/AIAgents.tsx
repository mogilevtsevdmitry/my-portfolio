import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Card } from '@/components/ui/Card';

const capabilities = [
  { icon: '🧠', key: 'llm', title: 'LLM интеграция', desc: 'GPT-4, Claude, Gemini — выбираю модель под задачу' },
  { icon: '🔄', key: 'pipeline', title: 'AI пайплайны', desc: 'Многошаговые процессы с ветвлением и условиями' },
  { icon: '🤝', key: 'multi', title: 'Мульти-агентные системы', desc: 'Оркестрация команд агентов для сложных задач' },
  { icon: '🔌', key: 'rag', title: 'RAG и базы знаний', desc: 'Векторный поиск + контекстная память агентов' },
  { icon: '⚡', key: 'automation', title: 'Process automation', desc: 'Замена ручных процессов на AI-воркфлоу' },
  { icon: '📊', key: 'monitor', title: 'Мониторинг агентов', desc: 'Трекинг решений, затрат и качества ответов' },
];

export function AIAgents() {
  return (
    <Section id="ai">
      <div className="mb-14">
        <span className="section-eyebrow">03. ИИ-агенты</span>
        <hr className="gold-divider mt-3" style={{ width: '3rem' }} />
      </div>
      <div className="text-center mb-12">
        <GlowText as="h2" className="text-3xl md:text-4xl font-bold mb-4">
          AI-агенты и автоматизация
        </GlowText>
        <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
          Создаю системы, где AI не просто отвечает на вопросы — а выполняет работу
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {capabilities.map(({ icon, key, title, desc }) => (
          <Card key={key}>
            <div className="text-2xl mb-3">{icon}</div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
            <p className="text-sm text-[var(--text-muted)]">{desc}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
