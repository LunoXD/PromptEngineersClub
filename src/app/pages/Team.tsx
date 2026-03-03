import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Linkedin, Github, Mail } from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";

const teamMembers = [
  {
    name: "Alex Johnson",
    role: "President",
    image: "https://images.unsplash.com/photo-1747811853766-7a6612797dc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBlbmdpbmVlciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM2NjY5NXww&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "Passionate about robotics and automation. Leading our club towards innovation.",
  },
  {
    name: "Sarah Martinez",
    role: "Vice President",
    image: "https://images.unsplash.com/photo-1580983218547-8333cb1d76b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGVuZ2luZWVyJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjMzMTI5OHww&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "Software engineer with expertise in AI and machine learning applications.",
  },
  {
    name: "Michael Chen",
    role: "Technical Lead",
    image: "https://images.unsplash.com/photo-1768796370407-6d36619e7d6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMGVuZ2luZWVyaW5nfGVufDF8fHx8MTc3MjM2ODM5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "Electronics and embedded systems specialist. Driving technical excellence.",
  },
  {
    name: "Emily Davis",
    role: "Project Manager",
    image: "https://images.unsplash.com/photo-1767163934854-655747a35068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwcHJvamVjdCUyMGlubm92YXRpb258ZW58MXx8fHwxNzcyNDU1MzM2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "Organizing and coordinating projects to ensure timely delivery and quality.",
  },
  {
    name: "David Kim",
    role: "Design Lead",
    image: "https://images.unsplash.com/photo-1723730741647-caaea47ac90f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2JvdGljcyUyMGVuZ2luZWVyaW5nJTIwcHJvamVjdHxlbnwxfHx8fDE3NzI0MDIzNjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "Mechanical design and prototyping expert with a passion for innovation.",
  },
  {
    name: "Lisa Anderson",
    role: "Events Coordinator",
    image: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NzI0MjYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "Organizing workshops, seminars, and club events to foster learning and growth.",
  },
];

export function Team() {
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <ScrollReveal key={index} delay={(index % 3) * 80}>
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
                    <button className="p-3 bg-white/15 border border-white/30 rounded-full hover:bg-white/30 transition-colors">
                      <Linkedin size={18} className="text-white" />
                    </button>
                    <button className="p-3 bg-white/15 border border-white/30 rounded-full hover:bg-white/30 transition-colors">
                      <Github size={18} className="text-white" />
                    </button>
                    <button className="p-3 bg-white/15 border border-white/30 rounded-full hover:bg-white/30 transition-colors">
                      <Mail size={18} className="text-white" />
                    </button>
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