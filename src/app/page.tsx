import HomeShell from "@/components/layout/HomeShell";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Tools from "@/components/sections/Tools";
import Contact from "@/components/sections/Contact";

const sectionIds = [
  "hero",
  "about",
  "skills",
  "experience",
  "projects",
  "contact",
  "lab",
] as const;

export default function Home() {
  return (
    <HomeShell sectionIds={sectionIds}>
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Contact />
      <Tools />
    </HomeShell>
  );
}
