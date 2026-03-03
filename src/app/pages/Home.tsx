import { Link } from "react-router";
import { ArrowRight, Users, Lightbulb, Calendar } from "lucide-react";

export function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Prompt Engineering Club
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Empowering engineering students through innovation, collaboration, and continuous learning.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            View Our Projects
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Team</h3>
              <p className="text-gray-600 mb-4">
                Meet our talented members who drive innovation and excellence in every project.
              </p>
              <Link to="/team" className="text-black font-medium hover:underline">
                Meet the team →
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovative Projects</h3>
              <p className="text-gray-600 mb-4">
                Explore our cutting-edge projects that solve real-world engineering challenges.
              </p>
              <Link to="/projects" className="text-black font-medium hover:underline">
                View projects →
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Events & Plans</h3>
              <p className="text-gray-600 mb-4">
                Stay updated with our upcoming events, workshops, and scheduled activities.
              </p>
              <Link to="/plans" className="text-black font-medium hover:underline">
                View schedule →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join Us?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect with like-minded engineering enthusiasts and be part of something extraordinary.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get in Touch
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}