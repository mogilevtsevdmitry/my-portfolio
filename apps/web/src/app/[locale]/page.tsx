import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Values } from '@/components/sections/Values';
import { Projects } from '@/components/sections/Projects';
import { TechStack } from '@/components/sections/TechStack';
import { AIAgents } from '@/components/sections/AIAgents';
import { WorkProcess } from '@/components/sections/WorkProcess';
import { ContactForm } from '@/components/sections/ContactForm';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Values />
      <Projects />
      <TechStack />
      <AIAgents />
      <WorkProcess />
      <ContactForm />
    </>
  );
}
