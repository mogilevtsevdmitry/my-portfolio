import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Values } from '@/components/sections/Values';
import { Projects } from '@/components/sections/Projects';
import { TechStack } from '@/components/sections/TechStack';
import { AIAgents } from '@/components/sections/AIAgents';
import { WorkProcess } from '@/components/sections/WorkProcess';
import { ContactForm } from '@/components/sections/ContactForm';
import { fetchAllProjects } from '@/lib/projects';

export default async function HomePage() {
  const projects = await fetchAllProjects();

  return (
    <>
      <Hero />
      <About />
      <Values />
      <AIAgents />
      <Projects projects={projects} />
      <TechStack />
      <WorkProcess />
      <ContactForm />
    </>
  );
}
