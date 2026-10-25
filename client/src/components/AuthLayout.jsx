import { Link } from "react-router-dom";
import { Brand, Icon } from "./ui";
export default function AuthLayout({
  eyebrow = "A better way to go",
  title,
  text,
  children,
  driver = false,
}) {
  return (
    <div className="auth-page">
      <section className="auth-main">
        <Brand />
        <div className="auth-content">
          <Link className="back-link" to="/">
            <Icon name="back" size={16} /> Back to home
          </Link>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p className="auth-intro">{text}</p>
          {children}
        </div>
        <footer>
          © {new Date().getFullYear()} ELOCAB · Made for journeys in Kumasi.
        </footer>
      </section>
      <aside className="auth-visual">
        <img
          src={
            driver ? "/images/nissan-caravan.jpg" : "/images/toyota-voxy.jpg"
          }
          alt={
            driver
              ? "Nissan Caravan available with ELOCAB"
              : "Toyota Voxy available with ELOCAB"
          }
        />
        <div className="auth-visual-caption">
          <span className="visual-tag">
            <Icon name="pin" size={16} /> Kumasi, Ghana
          </span>
          <h2>
            {driver
              ? "Your car. Your schedule. Your next chapter."
              : "A good journey starts with a great ride."}
          </h2>
          <p>
            Reliable rides anytime.
            <br />
            Your journey, our priority.
          </p>
        </div>
      </aside>
    </div>
  );
}
