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
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Our Team</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Meet the dedicated members who make Prompt Engineering Club a thriving community of innovation and excellence.
          </p>
        </ScrollReveal>

        {/* Team Grid */}
        {loading && <p className="text-center text-gray-400 mb-6">Loading team members...</p>}
        {error && <p className="text-center text-red-400 mb-6">{error}</p>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && !error && teamMembers.map((member, index) => (
            <ScrollReveal key={member._id} delay={(index % 3) * 80}>
              <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                {/* Image with social overlay */}
                <div className="aspect-square overflow-hidden bg-gray-100 relative">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover overlay with social icons */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <a href={member.linkedin || "#"} target="_blank" rel="noreferrer" className="p-3 bg-white/15 border border-white/30 rounded-full hover:bg-white/30 transition-colors">
                      <Linkedin size={18} className="text-white" />
                    </a>
                    <a href={member.github || "#"} target="_blank" rel="noreferrer" className="p-3 bg-white/15 border border-white/30 rounded-full hover:bg-white/30 transition-colors">
                      <Github size={18} className="text-white" />
                    </a>
                    <a href={member.email ? `mailto:${member.email}` : "#"} className="p-3 bg-white/15 border border-white/30 rounded-full hover:bg-white/30 transition-colors">
                      <Mail size={18} className="text-white" />
                    </a>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-0.5">{member.name}</h3>
                  <span className="inline-block text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full mb-3">
                    {member.role}
                  </span>
                  <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}