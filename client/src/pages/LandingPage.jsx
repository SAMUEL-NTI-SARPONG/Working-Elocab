import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button, Icon, Modal } from "../components/ui";
const fleet = [
  ["Toyota Vitz", "Everyday journeys", "toyota-vitz.jpg"],
  ["Toyota Voxy", "Room for your plans", "toyota-voxy.jpg"],
  ["Toyota Hiace", "Bring everyone along", "toyota-hiace.jpg"],
  ["Nissan Caravan", "Go together", "nissan-caravan.jpg"],
];
export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [route, setRoute] = useState({ pickupPoint: "", destination: "" });
  const [instructions, setInstructions] = useState(false);
  const { isInstalled, isInstallable, promptInstall } = useInstallPrompt();
  const bookPath = user ? homeFor(user.role) : "/register?role=customer";
  const submit = (e) => {
    e.preventDefault();
    sessionStorage.setItem("elocab_booking_draft", JSON.stringify(route));
    navigate(bookPath);
  };
  const install = async () => {
    if (isInstallable) await promptInstall();
    else setInstructions(true);
  };
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        <section className="hero site-container">
          <div className="hero-copy">
            <div className="eyebrow hero-eyebrow">
              <span />
              YOUR CITY. YOUR JOURNEY.
            </div>
            <h1>
              A better way
              <br />
              to get <span>there.</span>
            </h1>
            <p className="hero-description">
              From everyday trips to bigger plans, find your ride in Kumasi.
              We'll take care of the journey.
            </p>
            <form className="route-planner" onSubmit={submit}>
              <div className="route-planner-title">
                <Icon name="car" />
                <strong>Where would you like to go?</strong>
                <span>Kumasi</span>
              </div>
              <div className="route-inputs">
                <label>
                  <span className="route-marker" />
                  <span className="sr-only">Pickup location</span>
                  <input
                    required
                    maxLength={250}
                    placeholder="Enter pickup location"
                    value={route.pickupPoint}
                    onChange={(e) =>
                      setRoute({ ...route, pickupPoint: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span className="route-marker route-marker-square" />
                  <span className="sr-only">Destination</span>
                  <input
                    required
                    maxLength={250}
                    placeholder="Where to?"
                    value={route.destination}
                    onChange={(e) =>
                      setRoute({ ...route, destination: e.target.value })
                    }
                  />
                </label>
              </div>
              <Button type="submit" className="button-full">
                Let's find your ride <Icon name="arrow" size={18} />
              </Button>
              <p className="planner-note">
                <Icon name="shield" size={14} /> Book ahead. Travel with peace
                of mind.
              </p>
            </form>
            <div className="hero-footnote">
              <span className="mini-check">
                <Icon name="check" size={13} />
              </span>{" "}
              Local drivers <span className="dot-separator">·</span> Dropping &
              hiring <span className="dot-separator">·</span> Real-time updates
            </div>
          </div>
          <div className="hero-visual">
            <img
              className="hero-car"
              src="/images/toyota-voxy.jpg"
              alt="A Toyota Voxy ready for your next ELOCAB journey"
              fetchpriority="high"
            />
            <div className="location-pill">
              <Icon name="pin" size={16} /> Made for Kumasi
            </div>
            <div className="hero-image-caption">
              <div>
                <span>A RIDE FOR EVERY PLAN</span>
                <strong>Go at your own pace.</strong>
              </div>
              <Link
                className="round-arrow"
                to={bookPath}
                aria-label="Find your ELOCAB ride"
              >
                <Icon name="arrow" size={24} />
              </Link>
            </div>
            <div className="hero-photo-index">
              Toyota Voxy · The ELOCAB fleet
            </div>
          </div>
        </section>
        <section className="service-section" id="services">
          <div className="site-container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">HOW DO YOU WANT TO GO?</span>
                <h2>Your day. Your kind of ride.</h2>
              </div>
              <p>
                A quick drop-off or a car for your plans.
                <br />
                There's an ELOCAB journey for you.
              </p>
            </div>
            <div className="service-grid">
              <Link className="service-card" to={bookPath}>
                <span className="service-icon">
                  <Icon name="pin" size={27} />
                </span>
                <div>
                  <span className="eyebrow">POINT A TO POINT B</span>
                  <h3>Just dropping?</h3>
                  <p>
                    Get where you need to be. Book a pickup and destination, and
                    we'll assign your driver.
                  </p>
                </div>
                <span className="service-link">
                  Book a dropping ride <Icon name="arrow" size={18} />
                </span>
              </Link>
              <Link className="service-card service-card-orange" to={bookPath}>
                <span className="service-icon">
                  <Icon name="clock" size={27} />
                </span>
                <div>
                  <span className="eyebrow">
                    MORE TIME. MORE POSSIBILITIES.
                  </span>
                  <h3>A car for your plans.</h3>
                  <p>
                    Choose hiring for a journey that needs a little more
                    flexibility. Add your plans in the booking notes.
                  </p>
                </div>
                <span className="service-link">
                  Explore hiring <Icon name="arrow" size={18} />
                </span>
              </Link>
            </div>
          </div>
        </section>
        <section className="fleet-section site-container" id="fleet">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MEET YOUR NEXT RIDE</span>
              <h2>Small trips. Big adventures.</h2>
            </div>
            <Link className="text-link" to={bookPath}>
              Find your ride <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="fleet-grid">
            {fleet.map(([name, note, image]) => (
              <Link className="fleet-card" key={name} to={bookPath}>
                <div className="fleet-image">
                  <img src={`/images/${image}`} alt={name} loading="lazy" />
                  <span>
                    <Icon name="arrow" size={19} />
                  </span>
                </div>
                <h3>{name}</h3>
                <p>{note}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="how-section site-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LESS PLANNING. MORE GOING.</span>
              <h2>Three steps, then you're off.</h2>
            </div>
          </div>
          <div className="steps-grid">
            {[
              [
                "01",
                "Tell us your plans",
                "Choose dropping or hiring, your route, and the time you want to travel.",
              ],
              [
                "02",
                "Meet your driver",
                "We assign your ride. Find your driver and vehicle details in your dashboard.",
              ],
              [
                "03",
                "Enjoy the journey",
                "Follow your ride status, stay updated, and get where you need to be.",
              ],
            ].map(([n, title, text]) => (
              <div className="how-step" key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="driver-section site-container" id="drive">
          <div className="driver-image">
            <img
              src="/images/nissan-caravan.jpg"
              alt="Nissan Caravan for group journeys"
              loading="lazy"
            />
          </div>
          <div className="driver-copy">
            <span className="eyebrow">PUT YOUR NEXT CHAPTER IN DRIVE</span>
            <h2>
              Your car.
              <br />
              Your schedule.
              <br />
              <span>Your opportunity.</span>
            </h2>
            <p>
              Make room for more possibilities. Join our driver community,
              manage your availability, and take rides on your terms.
            </p>
            <Link className="button button-primary" to="/register?role=driver">
              Become a driver <Icon name="arrow" size={18} />
            </Link>
          </div>
        </section>
        <section className="get-going site-container">
          <div>
            <span className="eyebrow">TAKE ELOCAB WITH YOU</span>
            <h2>Your next ride, a little closer.</h2>
            <p>
              Add ELOCAB to your home screen for easy access to your journeys.
            </p>
          </div>
          <Button variant="outline" onClick={install} disabled={isInstalled}>
            <Icon name="download" />
            {isInstalled ? "Already installed" : "Get the ELOCAB app"}
          </Button>
        </section>
      </main>
      <Footer />
      <Modal
        open={instructions}
        onClose={() => setInstructions(false)}
        title="Keep ELOCAB close"
      >
        <p className="modal-description">
          Use your browser's menu to install ELOCAB. On iPhone or iPad, open
          this site in Safari, tap Share, then Add to Home Screen. On Android,
          look for Install app or Add to Home screen in your browser menu. On
          desktop, use the install icon in your address bar when available.
        </p>
        <Button onClick={() => setInstructions(false)}>Got it</Button>
      </Modal>
    </>
  );
}
