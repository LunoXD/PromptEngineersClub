import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Users, Lightbulb, Calendar } from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";
import DotGrid from "../components/DotGrid";
import VariableProximity from "../components/VariableProximity";
import Squares from "../components/Squares";
import { api, HomeContent } from "../lib/api";
import discordIcon from "../../assets/images/social/discord.jpeg";
import gmailIcon from "../../assets/images/social/gmail.webp";
import linkedinIcon from "../../assets/images/social/linkedin.png";
import telegramIcon from "../../assets/images/social/telegram.png";
import whatsappIcon from "../../assets/images/social/whatsapp.webp";

const iconMap = {
  Users,
  Lightbulb,
  Calendar,
} as const;

const dockItems = [
  {
    label: "Discord",
    icon: discordIcon,
    href: "https://discord.com/invite/promptengineering",
    bg: "bg-indigo-500/90",
  },
  {
    label: "Telegram",
    icon: telegramIcon,
    href: "https://t.me/promptengineeringclub",
    bg: "bg-sky-500/90",
  },
  {
    label: "WhatsApp",
    icon: whatsappIcon,
    href: "https://wa.me/918074524800",
    bg: "bg-emerald-500/90",
  },
  {
    label: "LinkedIn",
    icon: linkedinIcon,
    href: "https://www.linkedin.com/company/prompt-engineering-club",
    bg: "bg-blue-600/90",
  },
  {
    label: "Gmail",
    icon: gmailIcon,
    href: "mailto:deepak.yaramala@gmail.com",
    bg: "bg-rose-500/90",
  },
] as const;

export function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const [content, setContent] = useState<HomeContent>({
    heroBadge: "",
    heroDescription: "",
    stats: [],
    features: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publicCounts, setPublicCounts] = useState({ members: 0, projects: 0, plans: 0 });
  const [hoveredDockIndex, setHoveredDockIndex] = useState<number | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true
  );

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      api.getHomeContent(),
      api.getTeam(),
      api.getProjects(),
      api.getPlans(),
    ])
      .then(([homeRes, teamRes, projectRes, planRes]) => {
        if (!mounted) return;

        if (homeRes.status === "fulfilled") {
          setContent(homeRes.value);
        } else {
          setError(homeRes.reason instanceof Error ? homeRes.reason.message : "Failed to load content");
        }

        setPublicCounts({
          members: teamRes.status === "fulfilled" ? teamRes.value.length : 0,
          projects: projectRes.status === "fulfilled" ? projectRes.value.length : 0,
          plans: planRes.status === "fulfilled" ? planRes.value.length : 0,
        });
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => {
      setIsDarkTheme(root.classList.contains("dark"));
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const features = useMemo(() => content.features || [], [content.features]);
  const stats = useMemo(() => content.stats || [], [content.stats]);
  const displayStats = useMemo(() => {
    if (stats.length > 0) return stats;
    return [
      { value: String(publicCounts.members), label: "Members Listed" },
      { value: String(publicCounts.projects), label: "Projects Listed" },
      { value: String(publicCounts.plans), label: "Plans Listed" },
    ];
  }, [stats, publicCounts]);

  return (
    <div className="relative">
      <aside className="fixed left-4 top-1/2 z-40 -translate-y-1/2 hidden md:flex">
        <div
          className="rounded-2xl border border-white/20 bg-black/35 backdrop-blur-xl px-2 py-3 shadow-[0_30px_55px_-35px_rgba(0,0,0,0.9)]"
          onMouseLeave={() => setHoveredDockIndex(null)}
        >
          <div className="flex flex-col items-center gap-2">
            {dockItems.map((item, idx) => {
              const distance = hoveredDockIndex === null ? 99 : Math.abs(hoveredDockIndex - idx);
              const scale =
                hoveredDockIndex === null ? 1 : distance === 0 ? 1.75 : distance === 1 ? 1.35 : distance === 2 ? 1.12 : 1;
              const translateY = hoveredDockIndex === null ? 0 : distance === 0 ? -10 : distance === 1 ? -5 : 0;
              const isActive = hoveredDockIndex === idx;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setHoveredDockIndex(idx)}
                  className="group relative"
                  style={{
                    transform: `translateY(${translateY}px) scale(${scale})`,
                    transition: "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                  }}
                >
                  <span className="sr-only">{item.label}</span>
                  <span className={`absolute left-full top-1/2 ml-2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-white bg-black/80 transition-all duration-150 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1 pointer-events-none"}`}>
                    {item.label}
                  </span>
                  <span className={`w-12 h-12 rounded-2xl ${item.bg} border border-white/30 overflow-hidden flex items-center justify-center shadow-[0_16px_28px_-20px_rgba(0,0,0,0.8)]`}>
                    <img src={item.icon} alt={item.label} className="w-full h-full object-cover" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </aside>

      <aside className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 md:hidden">
        <div
          className="rounded-2xl border border-white/20 bg-black/35 backdrop-blur-xl px-3 py-2 shadow-[0_24px_45px_-35px_rgba(0,0,0,0.95)]"
          onMouseLeave={() => setHoveredDockIndex(null)}
        >
          <div className="flex items-center gap-2">
            {dockItems.map((item, idx) => {
              const distance = hoveredDockIndex === null ? 99 : Math.abs(hoveredDockIndex - idx);
              const scale = hoveredDockIndex === null ? 1 : distance === 0 ? 1.35 : distance === 1 ? 1.15 : 1;
              return (
                <a
                  key={`mobile-${item.label}`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setHoveredDockIndex(idx)}
                  className="block"
                  style={{
                    transform: `scale(${scale})`,
                    transition: "transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                  }}
                >
                  <span className="sr-only">{item.label}</span>
                  <span className={`w-10 h-10 rounded-xl ${item.bg} border border-white/30 overflow-hidden flex items-center justify-center`}>
                    <img src={item.icon} alt={item.label} className="w-full h-full object-cover" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Full-page interactive dot-grid background (fixed so it covers the whole page while scrolling) */}
      <div className="fixed inset-0 z-0">
        {isDarkTheme ? (
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
        ) : (
          <Squares
            speed={0.5}
            squareSize={40}
            direction="diagonal"
            borderColor="#271E37"
            hoverFillColor="#222222"
          />
        )}
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-transparent">
        <div className="relative max-w-7xl mx-auto text-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-7 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {content.heroBadge || "Applications Open"}
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
              {content.heroDescription || "Empowering engineering students through innovation, collaboration, and continuous learning."}
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
        {loading && <p className="text-center text-gray-400 mb-4">Loading homepage content...</p>}
        {error && <p className="text-center text-red-400 mb-4">{error}</p>}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {!loading && !error && displayStats.map((s, i) => (
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
            {!loading && !error && features.map(({ icon, title, desc, link, cta }, i) => {
              const Icon = icon && icon in iconMap ? iconMap[icon as keyof typeof iconMap] : Lightbulb;
              return (
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
                    {cta || "Learn more"} <ArrowRight size={14} />
                  </Link>
                </div>
              </ScrollReveal>
            )})}
            {!loading && !error && features.length === 0 && (
              <p className="md:col-span-3 text-center text-gray-400 text-sm">No feature cards have been published yet.</p>
            )}
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