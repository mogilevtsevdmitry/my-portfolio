import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Values } from '@/components/sections/Values';
import { Projects } from '@/components/sections/Projects';
import { TechStack } from '@/components/sections/TechStack';
import { AIAgents } from '@/components/sections/AIAgents';
import { WorkProcess } from '@/components/sections/WorkProcess';
import { ContactForm } from '@/components/sections/ContactForm';
import { FullPageScroll } from '@/components/layout/FullPageScroll';
import { fetchAllProjects } from '@/lib/projects';

const SECTIONS = [
  'Главная', 'Обо мне', 'Услуги', 'Проекты',
  'Технологии', 'ИИ-агенты', 'Процесс', 'Контакты',
];

export default async function HomePage() {
  const projects = await fetchAllProjects();

  return (
    <FullPageScroll sectionLabels={SECTIONS}>
      <Hero />
      <About />
      <Values />
      <Projects projects={projects} />
      <TechStack />
      <AIAgents />
      <WorkProcess />
      <ContactForm />
    </FullPageScroll>
  );
}
