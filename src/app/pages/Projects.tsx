import { useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ExternalLink, Github } from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";

const projects = [
  {
    title: "Autonomous Navigation Robot",
    description: "A self-navigating robot using computer vision and machine learning for obstacle detection and path planning.",
    image: "https://images.unsplash.com/photo-1723730741647-caaea47ac90f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2JvdGljcyUyMGVuZ2luZWVyaW5nJTIwcHJvamVjdHxlbnwxfHx8fDE3NzI0MDIzNjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Robotics", "AI", "Computer Vision"],
    status: "Completed",
  },
  {
    title: "Smart Campus IoT System",
    description: "IoT-based system for monitoring and optimizing energy consumption across campus buildings.",
    image: "https://images.unsplash.com/photo-1767163934854-655747a35068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwcHJvamVjdCUyMGlubm92YXRpb258ZW58MXx8fHwxNzcyNDU1MzM2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["IoT", "Sustainability", "Data Analytics"],
    status: "In Progress",
  },
  {
    title: "Student Portal Web App",
    description: "Full-stack web application for student management, course registration, and academic tracking.",
    image: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NzI0MjYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Web Development", "React", "Node.js"],
    status: "Completed",
  },
  {
    title: "Renewable Energy Monitoring",
    description: "System for real-time monitoring and analysis of solar panel efficiency and power generation.",
    image: "https://images.unsplash.com/photo-1768796370407-6d36619e7d6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMGVuZ2luZWVyaW5nfGVufDF8fHx8MTc3MjM2ODM5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["Renewable Energy", "Embedded Systems", "Data Science"],
    status: "In Progress",
  },
  {
    title: "AI-Powered Study Assistant",
    description: "Machine learning application that provides personalized study recommendations and tracks learning progress.",
    image: "https://images.unsplash.com/photo-1580983218547-8333cb1d76b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGVuZ2luZWVyJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjMzMTI5OHww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["AI", "Machine Learning", "Education"],
    status: "Planning",
  },
  {
    title: "3D Printer Optimization",
    description: "Research project on improving 3D printing efficiency through advanced material analysis and print path optimization.",
    image: "https://images.unsplash.com/photo-1747811853766-7a6612797dc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBlbmdpbmVlciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM2NjY5NXww&ixlib=rb-4.1.0&q=80&w=1080",
    tags: ["3D Printing", "Manufacturing", "Research"],
    status: "Completed",
  },
];

const statusConfig: Record<string, { badge: string; dot: string }> = {
  Completed: { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  "In Progress": { badge: "bg-blue-50 text-blue-700 border border-blue-200", dot: "bg-blue-500" },
  Planning: { badge: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
};

const filters = ["All", "Completed", "In Progress", "Planning"];

export function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.status === activeFilter);

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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, index) => {
            const s = statusConfig[project.status] ?? {
              badge: "bg-gray-50 text-gray-700 border border-gray-200",
              dot: "bg-gray-400",
            };
            return (
              <ScrollReveal key={index} delay={(index % 3) * 80}>
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
                      <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1 justify-center font-medium">
                        <Github size={14} />
                        Code
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex-1 justify-center font-medium">
                        <ExternalLink size={14} />
                        Details
                      </button>
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
