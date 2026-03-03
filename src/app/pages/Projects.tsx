import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ExternalLink, Github } from "lucide-react";

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

export function Projects() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Planning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Projects</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our innovative projects that push the boundaries of engineering and technology.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold flex-1">{project.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Github size={16} />
                    <span className="text-sm">Code</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <ExternalLink size={16} />
                    <span className="text-sm">Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
