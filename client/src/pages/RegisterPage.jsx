import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [step, setStep] = useState(1); // 1: Choose role, 2: Fill details
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    // Common
    name: "",
    // Customer fields
    phoneNumber: "",
    city: "Kumasi",
    // Driver fields
    baseLocation: "",
    carType: "",
    carNumber: "",
    licenseNumber: "",
    seats: "",
    contactNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        role,
        name: formData.name,
      };

      if (role === "customer") {
        userData.phoneNumber = formData.phoneNumber;
        userData.city = formData.city;
      } else if (role === "driver") {
        userData.baseLocation = formData.baseLocation;
        userData.carType = formData.carType;
        userData.carNumber = formData.carNumber;
        userData.licenseNumber = formData.licenseNumber;
        userData.seats = parseInt(formData.seats);
        userData.contactNumber = formData.contactNumber;
      }

      const user = await register(userData);
      toast.success("Registration successful!");

      // Redirect based on role
      if (user.role === "customer") {
        navigate("/customer/dashboard");
      } else if (user.role === "driver") {
        navigate("/driver/dashboard");
      }
    } catch (error) {
      toast.error(error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-light to-secondary items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="text-white text-center max-w-md relative z-10 animate-fade-in">
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
              <h2 className="text-5xl font-black mb-2 drop-shadow-lg">
                ELOCAB
              </h2>
              <p className="text-lg text-white/90 drop-shadow-md">
                Ride with Ease
              </p>
            </div>
          </div>

          <p className="text-2xl font-light mb-4 drop-shadow-lg">
            Join us today
          </p>
          {step === 1 && (
            <p className="text-lg opacity-90 drop-shadow-md">
              Choose your journey: ride with us or drive for us
            </p>
          )}
          {step === 2 && role === "customer" && (
            <p className="text-lg opacity-90 drop-shadow-md">
              Get started with booking rides across Kumasi
            </p>
          )}
          {step === 2 && role === "driver" && (
            <p className="text-lg opacity-90 drop-shadow-md">
              Start earning on your own schedule
            </p>
          )}
        </div>
      </div>

      {/* Right side - Registration */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="max-w-md w-full animate-slide-up">
          {/* Header */}
          <div className="mb-10">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="text-gray-600 text-sm font-medium hover:text-primary inline-flex items-center mb-6 transition-colors group"
              >
                <svg
                  className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform"
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
                Back
              </button>
            )}
            {step === 1 && (
              <Link
                to="/"
                className="text-gray-600 text-sm font-medium hover:text-primary inline-flex items-center transition-colors group"
              >
                <svg
                  className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform"
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
                Back
              </Link>
            )}
            <h1 className="text-5xl font-bold text-gray-900 mt-8 mb-3">
              {step === 1 ? "Sign up" : `Sign up as ${role}`}
            </h1>
            <p className="text-gray-600 text-lg">
              {step === 1
                ? "Create your ELOCAB account"
                : "Complete your profile"}
            </p>
          </div>

          {/* Step 1: Choose Role */}
          {step === 1 && (
            <div className="space-y-4">
              <button
                onClick={() => selectRole("customer")}
                className="w-full p-6 bg-white hover:bg-gray-50 rounded-2xl transition-all group text-left border-2 border-gray-200 hover:border-primary shadow-soft hover:shadow-medium transform hover:-translate-y-1 animate-scale-in"
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      Sign up to ride
                    </h3>
                    <p className="text-gray-600">
                      Book rides, hire cars, and travel across Kumasi
                    </p>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => selectRole("driver")}
                className="w-full p-6 bg-white hover:bg-gray-50 rounded-2xl transition-all group text-left border-2 border-gray-200 hover:border-primary shadow-soft hover:shadow-medium transform hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <svg
                      className="w-6 h-6 text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      Sign up to drive
                    </h3>
                    <p className="text-gray-600">
                      Earn money on your schedule, be your own boss
                    </p>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

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

              <p className="text-gray-700 text-base mt-8">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Registration Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Common Fields */}
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all text-base placeholder-gray-500 hover:bg-gray-100"
                placeholder="Full name"
                required
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all text-base placeholder-gray-500 hover:bg-gray-100"
                placeholder="Email"
                required
              />

              {/* Customer Fields */}
              {role === "customer" && (
                <>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all text-base placeholder-gray-500 hover:bg-gray-100"
                    placeholder="Phone number"
                    required
                  />

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all text-base placeholder-gray-500 hover:bg-gray-100"
                    placeholder="City"
                    required
                  />
                </>
              )}

              {/* Driver Fields */}
              {role === "driver" && (
                <>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all text-base placeholder-gray-500 hover:bg-gray-100"
                    placeholder="Contact number"
                    required
                  />

                  <input
                    type="text"
                    name="baseLocation"
                    value={formData.baseLocation}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all text-base placeholder-gray-500 hover:bg-gray-100"
                    placeholder="Base location (e.g., Adum, KNUST)"
                    required
                  />

                  <select
                    name="carType"
                    value={formData.carType}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all text-base text-gray-900 hover:bg-gray-100"
                    required
                  >
                    <option value="">Select car type</option>
                    <option value="Toyota Vitz">Toyota Vitz</option>
                    <option value="Toyota Voxy">Toyota Voxy</option>
                    <option value="Toyota Hiace">Toyota Hiace</option>
                    <option value="Nissan Caravan">Nissan Caravan</option>
                    <option value="Other">Other</option>
                  </select>

                  <input
                    type="text"
                    name="carNumber"
                    value={formData.carNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all text-base placeholder-gray-500 hover:bg-gray-100"
                    placeholder="Car registration number"
                    required
                  />

                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all text-base placeholder-gray-500 hover:bg-gray-100"
                    placeholder="Driver's license number"
                    required
                  />

                  <input
                    type="number"
                    name="seats"
                    value={formData.seats}
                    onChange={handleChange}
                    min="2"
                    max="20"
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all text-base placeholder-gray-500 hover:bg-gray-100"
                    placeholder="Number of seats"
                    required
                  />
                </>
              )}

              {/* Password Fields */}
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all text-base placeholder-gray-500 hover:bg-gray-100"
                placeholder="Password (min. 6 characters)"
                required
                minLength="6"
              />

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary focus:bg-white transition-all text-base placeholder-gray-500 hover:bg-gray-100"
                placeholder="Confirm password"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-primary text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary-light shadow-soft hover:shadow-medium transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed text-base mt-6 overflow-hidden"
              >
                <span className="relative z-10">
                  {loading ? "Creating account..." : "Create account"}
                </span>
                {!loading && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700"></div>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
