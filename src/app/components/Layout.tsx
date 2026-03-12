import { Outlet, Link, useLocation } from "react-router";
import { Github, Twitter, Linkedin } from "lucide-react";
import PillNav from "./PillNav";
import logo from "../../assets/logo.svg";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Team", href: "/team" },
  { label: "Projects", href: "/projects" },
  { label: "Plans", href: "/plans" },
  { label: "Contact", href: "/contact" },
];

const footerLinks = [
  { to: "/team", label: "Team" },
  { to: "/projects", label: "Projects" },
  { to: "/plans", label: "Plans & Events" },
  { to: "/contact", label: "Contact" },
];

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen">
      {/* Pill Navigation — fixed, centered at top */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <PillNav
            logo={logo}
            logoAlt="PE"
            items={navItems}
            activeHref={pathname}
            baseColor="#111111"
            pillColor="#ffffff"
            pillTextColor="#111111"
            hoveredPillTextColor="#ffffff"
            ease="power2.out"
            initialLoadAnimation={false}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">PE</span>
                </div>
                <span className="font-semibold text-white text-sm">Prompt Engineering Club</span>
              </Link>
              <p className="text-sm leading-relaxed">
                Empowering engineering students through innovation, collaboration, and continuous learning.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Navigation</h4>
              <ul className="space-y-2">
                {footerLinks.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="p-2.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Github size={16} />
                </a>
                <a href="#" className="p-2.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Twitter size={16} />
                </a>
                <a href="#" className="p-2.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Linkedin size={16} />
                </a>
              </div>
              <p className="text-xs mt-4 leading-relaxed">
                Engineering Building, Room 205<br />
                University Campus
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-xs text-gray-600">
              &copy; 2026 Prompt Engineering Club. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}