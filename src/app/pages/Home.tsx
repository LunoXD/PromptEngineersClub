import { Link } from "react-router";
import { ArrowRight, Users, Lightbulb, Calendar } from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";

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
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Dot-grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #e5e7eb 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white pointer-events-none" />

        <div className="relative max-w-7xl mx-auto text-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-sm font-medium bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 mb-7 text-gray-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Fall 2026 Applications Now Open
            </span>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.08]">
              Prompt{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-500 to-gray-900">
                Engineering
              </span>
              <br />Club
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
              Empowering engineering students through innovation, collaboration, and continuous learning.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={240}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/projects"
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-7 py-3.5 rounded-xl hover:bg-gray-800 active:scale-95 transition-all font-medium shadow-lg shadow-black/10"
              >
                View Our Projects
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 px-7 py-3.5 rounded-xl hover:bg-gray-50 active:scale-95 transition-all font-medium"
              >
                Join the Club
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 px-4 border-y border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <ScrollReveal key={i} delay={i * 70}>
              <div>
                <div className="text-3xl font-extrabold mb-0.5">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">What We Do</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Building the next generation of engineers through hands-on, real-world experience.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, link, cta }, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-white" size={22} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{title}</h3>
                  <p className="text-gray-500 mb-5 flex-1 leading-relaxed">{desc}</p>
                  <Link
                    to={link}
                    className="text-black font-medium inline-flex items-center gap-1.5 hover:gap-3 transition-all duration-200"
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
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center bg-black rounded-3xl px-8 py-16 relative overflow-hidden">
            {/* subtle grid on dark bg */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
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