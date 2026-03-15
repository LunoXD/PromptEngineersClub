import { useEffect, useMemo, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ExternalLink, Github } from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";
import { api, Project } from "../lib/api";

const statusConfig: Record<string, { badge: string; dot: string }> = {
  Completed: { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  "In Progress": { badge: "bg-blue-50 text-blue-700 border border-blue-200", dot: "bg-blue-500" },
  Planning: { badge: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
};

const filters = ["All", "Completed", "In Progress", "Planning"];

export function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    api
      .getProjects()
      .then((data) => {
        if (!mounted) return;
        setProjects(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load projects");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return activeFilter === "All"
      ? projects
      : projects.filter((p) => p.status === activeFilter);
  }, [activeFilter, projects]);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Our Projects</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Explore our innovative projects that push the boundaries of engineering and technology.
          </p>
        </ScrollReveal>

        {/* Filter Bar */}
        <ScrollReveal delay={100} className="flex flex-wrap gap-2 justify-center mb-12">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === f
                  ? "bg-black text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </ScrollReveal>

        {/* Projects Grid */}
        {loading && <p className="text-center text-gray-400 mb-6">Loading projects...</p>}
        {error && <p className="text-center text-red-400 mb-6">{error}</p>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && !error && filtered.map((project, index) => {
            const s = statusConfig[project.status] ?? {
              badge: "bg-gray-50 text-gray-700 border border-gray-200",
              dot: "bg-gray-400",
            };
            return (
              <ScrollReveal key={project._id} delay={(index % 3) * 80}>
                <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                  {/* Image */}
                  <div className="aspect-video overflow-hidden bg-gray-100 relative">
                    <ImageWithFallback
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-semibold leading-snug flex-1">{project.title}</h3>
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${s.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed flex-1">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {project.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <a href={project.repoUrl || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1 justify-center font-medium">
                        <Github size={14} />
                        Code
                      </a>
                      <a href={project.link || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex-1 justify-center font-medium">
                        <ExternalLink size={14} />
                        Details
                      </a>
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
