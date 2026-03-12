import { useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, Users, Lightbulb, Calendar } from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";
import DotGrid from "../components/DotGrid";
import VariableProximity from "../components/VariableProximity";

const stats = [
  { value: "50+", label: "Active Members" },
  { value: "12", label: "Projects Shipped" },
  { value: "8", label: "Events / Year" },
  { value: "3", label: "Awards Won" },
];

const features = [
  {
    icon: Users,
    title: "Expert Team",
    desc: "Meet our talented members who drive innovation and excellence in every project.",
    link: "/team",
    cta: "Meet the team",
  },
  {
    icon: Lightbulb,
    title: "Innovative Projects",
    desc: "Explore our cutting-edge projects that solve real-world engineering challenges.",
    link: "/projects",
    cta: "View projects",
  },
  {
    icon: Calendar,
    title: "Events & Plans",
    desc: "Stay updated with our upcoming events, workshops, and scheduled activities.",
    link: "/plans",
    cta: "View schedule",
  },
];

export function Home() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <div className="relative">
      {/* Full-page interactive dot-grid background (fixed so it covers the whole page while scrolling) */}
      <div className="fixed inset-0 z-0">
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#2a1f4a"
          activeColor="#7c3aed"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-transparent">
        <div className="relative max-w-7xl mx-auto text-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-7 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Fall 2026 Applications Now Open
            </span>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.08]">
              <VariableProximity
                label="Prompt Engineering Club"
                fromFontVariationSettings="'wght' 700, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={heroRef}
                radius={150}
                falloff="linear"
              />
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
              Empowering engineering students through innovation, collaboration, and continuous learning.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={240}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/projects"
                className="inline-flex items-center justify-center gap-2 bg-white text-black px-7 py-3.5 rounded-xl hover:bg-gray-200 active:scale-95 transition-all font-medium shadow-lg shadow-white/10"
              >
                View Our Projects
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-7 py-3.5 rounded-xl hover:bg-white/20 active:scale-95 transition-all font-medium"
              >
                Join the Club
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 py-10 px-4 border-y border-white/10 bg-black/60 backdrop-blur-md">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <ScrollReveal key={i} delay={i * 70}>
              <div>
                <div className="text-3xl font-extrabold mb-0.5">{s.value}</div>
                <div className="text-sm text-gray-400">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">What We Do</h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Building the next generation of engineers through hands-on, real-world experience.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, link, cta }, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="group bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-white/25 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 h-full flex flex-col">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-black" size={22} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
                  <p className="text-gray-400 mb-5 flex-1 leading-relaxed">{desc}</p>
                  <Link
                    to={link}
                    className="text-white font-medium inline-flex items-center gap-1.5 hover:gap-3 transition-all duration-200"
                  >
                    {cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center bg-black/90 rounded-3xl px-8 py-16 relative overflow-hidden">
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Join Us?
              </h2>
              <p className="text-gray-400 mb-8 text-lg max-w-xl mx-auto leading-relaxed">
                Connect with like-minded engineering enthusiasts and be part of something extraordinary.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-all font-medium"
              >
                Get in Touch
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}