import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useAuth } from "../context/AuthContext";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import InstallPrompt from "../components/InstallPrompt";
import toast from "react-hot-toast";

import "swiper/css";

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [secretCode, setSecretCode] = useState("");
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  // Show install prompt for first-time visitors after 2 seconds
  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem("elocab_install_prompt_seen");
    const hasSeenThisSession = sessionStorage.getItem(
      "elocab_install_shown_this_session",
    );

    if (!hasSeenPrompt && !hasSeenThisSession) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
        sessionStorage.setItem("elocab_install_shown_this_session", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDownloadClick = async () => {
    if (isInstalled) {
      toast.success("ELOCAB is already installed on your device!");
      return;
    }
    if (isInstallable) {
      const accepted = await promptInstall();
      if (accepted) {
        toast.success("App installed successfully! 🎉");
      }
    } else {
      // Show manual instructions for browsers that don't support beforeinstallprompt
      setShowInstructions(true);
    }
  };

  // Secret admin access - type "admin" anywhere on the page
  useEffect(() => {
    const handleKeyPress = (e) => {
      const newCode = (secretCode + e.key).slice(-5); // Keep last 5 chars
      setSecretCode(newCode);

      if (newCode === "admin") {
        navigate("/admin/login");
        setSecretCode(""); // Reset
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [secretCode, navigate]);

  useEffect(() => {
    if (user) {
      if (user.role === "customer") navigate("/customer/dashboard");
      else if (user.role === "driver") navigate("/driver/dashboard");
      else if (user.role === "admin") navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  const cars = [
    { name: "Toyota Vitz", image: "/images/toyota-vitz.jpg" },
    { name: "Nissan Caravan", image: "/images/nissan-caravan.jpg" },
    { name: "Toyota Hiace", image: "/images/toyota-hiace.jpg" },
    { name: "Toyota Voxy", image: "/images/toyota-voxy.jpg" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            speed={1000}
            loop={true}
            className="h-full w-full"
          >
            {cars.map((car, idx) => (
              <SwiperSlide key={idx}>
                <div className="w-full h-full relative">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-20 bg-gradient-to-br from-primary/55 via-primary-light/55 to-secondary/55"></div>

        <div className="container mx-auto px-6 md:px-12 relative z-30">
          <div className="max-w-4xl">
            <div className="mb-6 animate-slide-down">
              <span className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-semibold border border-white/20">
                🚗 Your Trusted Ride Partner
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight">
              <span
                className="block animate-slide-up"
                style={{
                  textShadow:
                    "0 4px 20px rgba(0, 0, 0, 0.5), 0 8px 40px rgba(0, 0, 0, 0.3)",
                  animationDelay: "0.1s",
                }}
              >
                Go anywhere
              </span>
              <span
                className="block bg-gradient-to-r from-white via-secondary-light to-secondary bg-clip-text text-transparent animate-slide-up"
                style={{
                  filter:
                    "drop-shadow(0 4px 20px rgba(0, 0, 0, 0.6)) drop-shadow(0 8px 40px rgba(0, 0, 0, 0.4))",
                  WebkitTextStroke: "1px rgba(255, 255, 255, 0.1)",
                  animationDelay: "0.3s",
                }}
              >
                with ELOCAB
              </span>
            </h1>
            <p
              className="text-xl md:text-2xl text-white/95 mb-12 font-light leading-relaxed max-w-2xl animate-fade-in"
              style={{
                textShadow:
                  "0 2px 10px rgba(0, 0, 0, 0.4), 0 4px 20px rgba(0, 0, 0, 0.2)",
                animationDelay: "0.5s",
              }}
            >
              Experience reliable rides anytime, anywhere in Kumasi. Your
              journey, our priority.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 animate-scale-in"
              style={{ animationDelay: "0.7s" }}
            >
              <button
                onClick={() => navigate("/register")}
                className="group relative px-10 py-5 bg-white text-primary rounded-2xl font-bold text-lg shadow-strong hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Get started now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
              <button
                onClick={() => navigate("/login")}
                className="group px-10 py-5 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transform hover:scale-105 transition-all duration-300"
              >
                Sign in
              </button>
            </div>

            {/* Download App Button - Always visible */}
            <div
              className="mt-6 animate-fade-in"
              style={{ animationDelay: "0.9s" }}
            >
              <button
                onClick={handleDownloadClick}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-[0_10px_40px_rgba(245,158,11,0.4)] transform hover:scale-105 transition-all duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {isInstalled ? "App Installed ✓" : "Download App"}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 animate-bounce-slow">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/70 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Driver Section */}
      <section className="relative py-32 pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-secondary"></div>

        {/* Animated background elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 left-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative container mx-auto px-6 md:px-12 z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-slide-up">
              <div className="inline-block px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-semibold mb-6 border border-white/20">
                🚗 For Drivers
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                Drive when you want,
                <span className="block bg-gradient-to-r from-secondary to-secondary-light bg-clip-text text-transparent">
                  make what you need
                </span>
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Make money on your schedule with deliveries or rides. Use your
                own car or choose a rental through ELOCAB.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-xl mx-auto">
                <div className="glass-dark rounded-xl p-4">
                  <div className="text-3xl mb-2">💰</div>
                  <h4 className="text-white font-bold mb-1">Flexible Income</h4>
                  <p className="text-white/70 text-sm">Earn on your terms</p>
                </div>
                <div className="glass-dark rounded-xl p-4">
                  <div className="text-3xl mb-2">⏰</div>
                  <h4 className="text-white font-bold mb-1">Your Schedule</h4>
                  <p className="text-white/70 text-sm">Work when you want</p>
                </div>
              </div>

              <button
                onClick={() => navigate("/register")}
                className="group relative px-10 py-5 bg-white text-primary rounded-2xl font-bold text-lg shadow-strong hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transform hover:scale-105 transition-all duration-300 overflow-hidden mb-12"
              >
                <span className="relative z-10">Sign up to drive</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative pt-32 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-secondary"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="relative container mx-auto px-6 md:px-12 text-center z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-semibold mb-6 border border-white/20 animate-slide-down">
              ✨ Join ELOCAB Today
            </div>

            <h2
              className="text-5xl md:text-6xl font-black mb-6 text-white animate-scale-in"
              style={{ animationDelay: "0.1s" }}
            >
              Ready to get started?
            </h2>

            <p
              className="text-xl mb-12 text-white/90 max-w-2xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Join thousands of satisfied customers and drivers across Kumasi.
              Experience the future of transportation today.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <button
                onClick={() => navigate("/register")}
                className="group relative px-12 py-5 bg-white text-secondary rounded-2xl font-bold text-lg shadow-strong hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Book a ride</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>

              <button
                onClick={() => navigate("/register")}
                className="group relative px-12 py-5 bg-transparent border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-secondary transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Become a driver</span>
              </button>
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="glass-dark rounded-2xl p-6 transform hover:scale-105 transition-transform">
                <div className="text-4xl font-black text-white mb-2">1000+</div>
                <div className="text-white/70">Happy Customers</div>
              </div>
              <div
                className="glass-dark rounded-2xl p-6 transform hover:scale-105 transition-transform"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="text-4xl font-black text-white mb-2">50+</div>
                <div className="text-white/70">Verified Drivers</div>
              </div>
              <div
                className="glass-dark rounded-2xl p-6 transform hover:scale-105 transition-transform"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="text-4xl font-black text-white mb-2">24/7</div>
                <div className="text-white/70">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* PWA Install Prompt for first-time visitors */}
      <InstallPrompt
        show={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
      />

      {/* Manual Install Instructions Modal (for browsers without beforeinstallprompt) */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-full p-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Install ELOCAB App
            </h2>
            <p className="text-gray-600 text-center mb-6 text-sm">
              Follow these steps to add ELOCAB to your home screen:
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-700 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-semibold">
                    For Chrome / Edge
                  </p>
                  <p className="text-xs text-gray-500">
                    Tap the menu (⋮) → "Install app" or "Add to Home screen"
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-700 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-semibold">
                    For Safari (iOS)
                  </p>
                  <p className="text-xs text-gray-500">
                    Tap the Share button (□↗) → "Add to Home Screen"
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-700 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-semibold">
                    For Firefox
                  </p>
                  <p className="text-xs text-gray-500">
                    Tap the menu (⋮) → "Install" or "Add to Home screen"
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
