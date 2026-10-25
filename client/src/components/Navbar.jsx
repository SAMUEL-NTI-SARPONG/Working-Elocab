import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";
import { Brand, Icon } from "./ui";
export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Brand />
        <nav className="desktop-site-nav" aria-label="Main navigation">
          <a href="/#services">Our services</a>
          <a href="/#fleet">Our fleet</a>
          <a href="/#drive">Drive with us</a>
        </nav>
        <div className="site-header-actions">
          {user ? (
            <Link className="button button-primary" to={homeFor(user.role)}>
              My dashboard <Icon name="arrow" size={16} />
            </Link>
          ) : (
            <>
              <Link className="sign-in-link" to="/login">
                Sign in
              </Link>
              <Link className="button button-primary" to="/register">
                Get started <Icon name="arrow" size={16} />
              </Link>
            </>
          )}
          <button
            type="button"
            className="icon-button mobile-menu-button"
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="site-mobile-menu"
          className="site-mobile-menu"
          aria-label="Mobile main navigation"
        >
          {[
            ["services", "Our services"],
            ["fleet", "Our fleet"],
            ["drive", "Drive with us"],
          ].map(([id, label]) => (
            <a key={id} href={`/#${id}`} onClick={() => setOpen(false)}>
              {label}
              <Icon name="arrow" size={16} />
            </a>
          ))}
          {!user && (
            <Link to="/login">
              Sign in <Icon name="arrow" size={16} />
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
