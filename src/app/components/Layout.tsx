import { Outlet, NavLink, Link } from "react-router";
import { Menu, X, Github, Twitter, Linkedin } from "lucide-react";
import { useState } from "react";

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/team", label: "Team" },
    { to: "/projects", label: "Projects" },
    { to: "/plans", label: "Plans" },
    { to: "/contact", label: "Contact Us" },
  ];

  const footerLinks = [
    { to: "/team", label: "Team" },
    { to: "/projects", label: "Projects" },
    { to: "/plans", label: "Plans & Events" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200/80 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">PE</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">Prompt Engineering Club</span>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "text-black font-medium bg-gray-100"
                        : "text-gray-600 hover:text-black hover:bg-gray-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg transition-colors text-sm ${
                      isActive
                        ? "text-black font-medium bg-gray-100"
                        : "text-gray-600 hover:text-black hover:bg-gray-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">PE</span>
              </div>
              <span className="font-semibold text-lg">Prompt Engineering Club</span>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive
                        ? "text-black font-medium"
                        : "text-gray-600 hover:text-black"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block py-2 transition-colors ${
                      isActive
                        ? "text-black font-medium"
                        : "text-gray-600 hover:text-black"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 Prompt Engineering Club. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}