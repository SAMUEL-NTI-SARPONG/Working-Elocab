import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LandingPageTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar scrolled={false} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-6xl font-bold text-gray-900">Welcome to ELOCAB</h1>
          <button onClick={() => navigate("/register")}>Get Started</button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24">
        <div className="container mx-auto">
          <h2 className="text-4xl">Our Services</h2>
        </div>
      </section>

      {/* Driver Section */}
      <section className="py-24">
        <div className="container mx-auto">
          <h2 className="text-4xl">Drive with us</h2>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPageTest;
