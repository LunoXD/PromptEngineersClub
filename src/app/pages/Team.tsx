import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Linkedin, Github, Mail } from "lucide-react";

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
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Team</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Meet the dedicated members who make Prompt Engineering Club a thriving community of innovation and excellence.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-gray-600 mb-3">{member.role}</p>
                <p className="text-gray-700 mb-4">{member.bio}</p>
                <div className="flex gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Linkedin size={18} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Github size={18} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Mail size={18} />
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