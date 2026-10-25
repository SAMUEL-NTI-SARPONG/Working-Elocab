import { Link } from "react-router-dom";
import { Brand, Icon } from "./ui";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div className="footer-brand">
          <Brand light />
          <p>
            Your trusted ride partner in Kumasi.
            <br />
            Reliable rides. Everyday possibilities.
          </p>
          <span>
            <Icon name="pin" size={16} /> Kumasi, Ghana
          </span>
        </div>
        <div>
          <h3>Explore ELOCAB</h3>
          <Link to="/register?role=customer">Book a ride</Link>
          <Link to="/register?role=driver">Become a driver</Link>
          <Link to="/login">Sign in</Link>
          <Link to="/admin/login">Admin workspace</Link>
        </div>
        <div>
          <h3>Let's talk</h3>
          <a href="tel:+233257160074">
            025 716 0074 <Icon name="arrow" size={14} />
          </a>
          <a
            href="https://wa.me/233240786555"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp: 024 078 6555 <Icon name="arrow" size={14} />
          </a>
          <a href="mailto:obedelobed@gmail.com">obedelobed@gmail.com</a>
        </div>
      </div>
      <div className="site-container footer-bottom">
        <span>© {new Date().getFullYear()} ELOCAB. All rights reserved.</span>
        <span>Your journey, our priority.</span>
      </div>
    </footer>
  );
}
