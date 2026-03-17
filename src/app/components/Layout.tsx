import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Github, Twitter, Linkedin } from "lucide-react";
import PillNav from "./PillNav";
import navLogo from "../../assets/images/logo.png";
import footerLogo from "../../assets/images/logonobg-optimized.png";
import { api } from "../lib/api";
import { clearAuthToken, getAuthToken } from "../lib/auth";

const baseNavItems = [
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
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.remove("light");
    window.localStorage.setItem("theme", "dark");
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getAuthToken()));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const updateAuth = () => setIsLoggedIn(Boolean(getAuthToken()));
    window.addEventListener("storage", updateAuth);
    updateAuth();
    return () => window.removeEventListener("storage", updateAuth);
  }, [pathname]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsAdmin(false);
      return;
    }

    let mounted = true;
    api
      .me(token)
      .then((res) => {
        if (!mounted) return;
        setIsAdmin(res.user.role === "admin");
      })
      .catch(() => {
        if (!mounted) return;
        setIsAdmin(false);
      });

    return () => {
      mounted = false;
    };
  }, [pathname, isLoggedIn]);

  const navItems = isLoggedIn
    ? isAdmin
      ? [...baseNavItems, { label: "Admin", href: "/admin" }]
      : [...baseNavItems]
    : [...baseNavItems, { label: "Login", href: "/login" }];

  const handleLogout = async () => {
    const token = getAuthToken();
    if (token) {
      try {
        await api.logout(token);
      } catch {
        // Fallback to local logout even if network call fails
      }
    }
    clearAuthToken();
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="atmo-shell min-h-screen bg-[radial-gradient(900px_420px_at_4%_-5%,rgba(37,99,235,0.16),transparent_52%),radial-gradient(980px_480px_at_110%_112%,rgba(99,102,241,0.16),transparent_52%)]">
      {isLoggedIn && (
        <button
          type="button"
          onClick={handleLogout}
          className="fixed top-4 right-4 z-[70] px-3 py-2 rounded-full border text-xs font-semibold transition-all duration-200 bg-black/70 border-white/20 text-white hover:bg-black hover:-translate-y-0.5"
        >
          Logout
        </button>
      )}

      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          <img
            src={navLogo}
            alt="Prompt Engineers Club"
            className="h-20 md:h-[5.5rem] w-auto object-contain"
          />
          <PillNav
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

      <main className="pt-20">
        <Outlet />
      </main>

      <footer className="text-gray-300 mt-20 px-3 sm:px-4 md:px-6">
          <div className="max-w-7xl mx-auto rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(3,7,18,0.96))] shadow-[0_28px_70px_-45px_rgba(15,23,42,0.95)] px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-10 mb-10">
              <div>
                <Link to="/" className="flex items-center gap-2.5 mb-4">
                  <img src={footerLogo} alt="Prompt Engineering" className="w-8 h-8 rounded-lg object-contain" />
                  <span className="font-semibold text-sm text-white">Prompt Engineering Club</span>
                </Link>
                <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
                  Empowering engineering students through innovation, collaboration, and continuous learning.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm mb-4">Navigation</h4>
                <ul className="space-y-2.5">
                  {footerLinks.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="text-sm transition-all duration-150 hover:text-white hover:translate-x-0.5 inline-flex"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  <a href="#" className="p-2.5 rounded-xl border border-white/10 transition-all duration-200 bg-gray-800/70 hover:bg-gray-700 hover:-translate-y-0.5">
                    <Github size={16} />
                  </a>
                  <a href="#" className="p-2.5 rounded-xl border border-white/10 transition-all duration-200 bg-gray-800/70 hover:bg-gray-700 hover:-translate-y-0.5">
                    <Twitter size={16} />
                  </a>
                  <a href="#" className="p-2.5 rounded-xl border border-white/10 transition-all duration-200 bg-gray-800/70 hover:bg-gray-700 hover:-translate-y-0.5">
                    <Linkedin size={16} />
                  </a>
                </div>
                <p className="text-xs mt-4 leading-relaxed">
                  Engineering Building, Room 205
                  <br />
                  University Campus
                </p>
              </div>
            </div>

            <div className="border-t pt-6 text-center border-gray-800/80">
              <p className="text-xs text-gray-600">&copy; 2026 Prompt Engineering Club. All rights reserved.</p>
            </div>
          </div>
      </footer>
    </div>
  );
}
