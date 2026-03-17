import { useEffect, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Linkedin, Github, Mail } from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";
import { api, TeamMember } from "../lib/api";

export function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    api
      .getTeam()
      .then((data) => {
        if (!mounted) return;
        setTeamMembers(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load team");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Team Grid */}
        {loading && <p className="text-center text-gray-400 mb-6">Loading team members...</p>}
        {error && <p className="text-center text-red-400 mb-6">{error}</p>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && !error && teamMembers.map((member, index) => {
            const links = [
              {
                label: "LinkedIn",
                href: member.linkedin || "",
                icon: Linkedin,
              },
              {
                label: "GitHub",
                href: member.github || "",
                icon: Github,
              },
              {
                label: "Email",
                href: member.email ? `mailto:${member.email}` : "",
                icon: Mail,
              },
            ];

            return (
            <ScrollReveal key={member._id} delay={(index % 3) * 80}>
              <div className="group relative rounded-3xl p-[1px] bg-[linear-gradient(145deg,rgba(148,163,184,0.45),rgba(15,23,42,0.1)_40%,rgba(56,189,248,0.32))] shadow-[0_22px_65px_-40px_rgba(14,116,144,0.75)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_32px_90px_-38px_rgba(14,165,233,0.68)]">
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(90%_75%_at_50%_100%,rgba(56,189,248,0.25),transparent_70%)]" />

                <div className="relative bg-[linear-gradient(170deg,rgba(2,6,23,0.95),rgba(15,23,42,0.93))] border border-white/10 rounded-[calc(1.5rem-1px)] overflow-hidden backdrop-blur-xl">
                {/* Image with social overlay */}
                <div className="aspect-square overflow-hidden bg-slate-900 relative">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-[0.6deg] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.02),rgba(2,6,23,0.78))]" />

                  <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/15 bg-black/30 backdrop-blur-md px-3 py-2">
                    <h3 className="text-lg font-semibold text-white leading-tight">{member.name}</h3>
                    <span className="inline-flex mt-1 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border border-cyan-300/35 bg-cyan-400/10 text-cyan-100">
                      {member.role}
                    </span>
                  </div>

                  {/* Hover overlay with social icons */}
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px] flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {links.map((item) => {
                      const Icon = item.icon;
                      const enabled = Boolean(item.href);
                      return (
                        <a
                          key={`${member._id}-${item.label}`}
                          href={enabled ? item.href : undefined}
                          target={enabled ? "_blank" : undefined}
                          rel={enabled ? "noreferrer" : undefined}
                          aria-label={item.label}
                          className={`p-3 rounded-full border transition-all duration-200 ${enabled ? "bg-white/15 border-white/35 hover:bg-cyan-300/20 hover:border-cyan-200/70 hover:-translate-y-0.5" : "bg-white/5 border-white/10 opacity-40 cursor-not-allowed"}`}
                        >
                          <Icon size={18} className="text-white" />
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="text-slate-200/90 text-sm leading-relaxed min-h-[3.75rem]">
                    {member.bio || "Club member profile will be updated soon."}
                  </p>
                </div>
              </div>
              </div>
            </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}