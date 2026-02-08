import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(formData.email, formData.password);
      toast.success("Login successful!");

      // Redirect based on role
      if (userData.role === "customer") {
        navigate("/customer/dashboard");
      } else if (userData.role === "driver") {
        navigate("/driver/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-light to-secondary items-center justify-center p-12 relative overflow-hidden">
        {/* Animated pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-10 animate-[gradient_15s_ease_infinite]"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="text-white text-center relative z-10 animate-scale-in">
          {/* Logo with animated ring - matching navbar style */}
          <div className="flex flex-col items-center mb-8 group">
            <div className="relative mb-4">
              {/* Animated ring background */}
              <div className="absolute inset-0 rounded-full bg-white/10 scale-100 group-hover:scale-125 transition-all duration-500"></div>
              <img
                src="/images/logo.png"
                alt="ELOCAB"
                className="h-32 w-auto relative z-10 drop-shadow-2xl group-hover:scale-105 transition-all duration-500"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <h1
                className="text-6xl font-black drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                style={{ display: "none" }}
              >
                ELOCAB
              </h1>
            </div>
            {/* Brand text */}
            <div className="text-center">
              <h2 className="text-5xl font-black mb-2 drop-shadow-lg">ELOCAB</h2>
              <p className="text-lg text-white/90 drop-shadow-md">Ride with Ease</p>
            </div>
          </div>
          
          <div className="glass-dark rounded-2xl p-8 max-w-md mx-auto">
            <p className="text-2xl font-bold drop-shadow-lg mb-2">
              Reliable rides anytime
            </p>
            <p className="text-lg opacity-90 drop-shadow-md">
              Your journey, our priority
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="max-w-md w-full animate-slide-up">
          {/* Header */}
          <div className="mb-12">
            <Link
              to="/"
              className="group text-gray-600 text-sm font-semibold hover:text-primary inline-flex items-center transition-all mb-8 glass-dark px-4 py-2 rounded-lg hover:bg-primary/5"
            >
              <svg
                className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to home
            </Link>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mt-8 mb-4 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Welcome back
            </h1>
            <p className="text-gray-600 text-lg">Sign in to continue to ELOCAB</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className="group animate-slide-in"
              style={{ animationDelay: "0.1s" }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base text-gray-900 placeholder-gray-400 hover:border-gray-300"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div
              className="group animate-slide-in"
              style={{ animationDelay: "0.2s" }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-base text-gray-900 placeholder-gray-400 hover:border-gray-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-gradient-to-r from-primary to-primary-light text-white py-4 px-6 rounded-xl font-bold hover:shadow-strong transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-base mt-8 overflow-hidden animate-scale-in"
              style={{ animationDelay: "0.3s" }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Continue
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
              {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <p className="text-gray-700 text-base">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary font-bold hover:text-primary-light transition-colors inline-flex items-center gap-1"
                >
                  Sign up
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
