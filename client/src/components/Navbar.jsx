import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100"
          : "bg-gradient-to-b from-black/30 to-transparent backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              {/* Logo with animated ring */}
              <div className={`absolute inset-0 rounded-full transition-all duration-300 ${scrolled ? 'bg-primary/5 scale-110' : 'bg-white/10 scale-100'} group-hover:scale-125`}></div>
              <img
                src="/images/logo.png"
                alt="ELOCAB"
                className="h-14 w-auto relative z-10 group-hover:scale-105 transition-all duration-500 drop-shadow-2xl"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                className={`hidden items-center justify-center h-14 px-4 ${
                  scrolled ? "text-primary" : "text-white"
                }`}
                style={{ display: "none" }}
              >
                <span className="text-2xl font-black tracking-tight">ELOCAB</span>
              </div>
            </div>
            <div className={`hidden md:block transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              <div className="text-xl font-black tracking-tight">ELOCAB</div>
              <div className={`text-xs ${scrolled ? 'text-gray-500' : 'text-white/80'}`}>Ride with Ease</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {/* Login Button */}
            <Link
              to="/login"
              className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                scrolled
                  ? "text-gray-700 hover:text-primary"
                  : "text-white"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Login</span>
              </span>
              <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                scrolled
                  ? "bg-gray-100 opacity-0 group-hover:opacity-100"
                  : "bg-white/10 opacity-0 group-hover:opacity-100"
              }`}></div>
            </Link>

            {/* Get Started Button - Primary CTA */}
            <Link
              to="/register"
              className={`group relative px-6 py-2.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl overflow-hidden ${
                scrolled
                  ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-md"
                  : "bg-white text-primary shadow-lg"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>Get Started</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
