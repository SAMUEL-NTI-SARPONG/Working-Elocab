import { useState } from "react";
import axios from "axios";
import DashboardShell from "../../components/DashboardShell";
import RideList from "../../components/RideList";
import ProfileForm from "../../components/ProfileForm";
import {
  PageHeading,
  Stat,
  Icon,
  Button,
  Field,
  ErrorBanner,
  LoadingState,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import useDashboardData from "../../hooks/useDashboardData";
import useAction from "../../hooks/useAction";
const initialBooking = () => {
  let draft = {};
  try {
    draft = JSON.parse(sessionStorage.getItem("elocab_booking_draft")) || {};
  } catch {}
  return {
    serviceType: "Dropping",
    pickupPoint: typeof draft.pickupPoint === "string" ? draft.pickupPoint : "",
    destination: typeof draft.destination === "string" ? draft.destination : "",
    dateTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    numberOfPeople: 1,
    notes: "",
  };
};
function BookingForm({ onBooked }) {
  const [values, setValues] = useState(initialBooking);
  const { run, busy } = useAction();
  const change = (e) =>
    setValues({ ...values, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const r = await run(
      () =>
        axios.post("/api/customers/bookings", {
          ...values,
          dateTime: new Date(values.dateTime).toISOString(),
          numberOfPeople: Number(values.numberOfPeople),
        }),
      "Your ride request is in. We’ll assign your driver soon.",
    );
    if (r.ok) {
      sessionStorage.removeItem("elocab_booking_draft");
      await onBooked();
    }
  };
  return (
    <div className="booking-layout">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Let's plan your journey</h2>
            <p>A few details, and we'll take it from here.</p>
          </div>
          <Icon name="car" />
        </div>
        <form className="form-stack" onSubmit={submit}>
          <div className="choice-grid" role="group" aria-label="Service type">
            {[
              ["Dropping", "A simple point-to-point ride", "pin"],
              ["Hiring", "A car for your plans", "clock"],
            ].map(([type, note, icon]) => (
              <button
                type="button"
                key={type}
                className={`choice-button ${values.serviceType === type ? "selected" : ""}`}
                aria-pressed={values.serviceType === type}
                onClick={() => setValues({ ...values, serviceType: type })}
              >
                <Icon name={icon} />
                <span>
                  <strong>{type}</strong>
                  <small>{note}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="form-divider" />
          <Field
            label="Pickup point"
            name="pickupPoint"
            placeholder="Where should we pick you up?"
            required
            maxLength={250}
            value={values.pickupPoint}
            onChange={change}
          />
          <Field
            label="Destination"
            name="destination"
            placeholder="Where are you headed?"
            required
            maxLength={250}
            value={values.destination}
            onChange={change}
          />
          <div className="form-grid">
            <Field
              label="Travel date & time"
              name="dateTime"
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              required
              value={values.dateTime}
              onChange={change}
            />
            <Field
              label="Passengers"
              name="numberOfPeople"
              type="number"
              min="1"
              max="30"
              step="1"
              required
              value={values.numberOfPeople}
              onChange={change}
            />
          </div>
          <Field
            as="textarea"
            label="Anything else we should know?"
            hint="Optional. Share a landmark, luggage details, or hiring plans."
            name="notes"
            rows={3}
            maxLength={1000}
            placeholder="A little detail goes a long way…"
            value={values.notes}
            onChange={change}
          />
          <Button type="submit" busy={busy} className="button-full">
            Request my ride <Icon name="arrow" size={18} />
          </Button>
          <p className="booking-note">
            <Icon name="shield" size={14} />
            We'll confirm your driver in My rides. Times are shown in Ghana
            time.
          </p>
        </form>
      </section>
      <aside className="booking-side">
        <section className="panel">
          <div className="panel-heading">
            <h2>A ride for every plan</h2>
          </div>
          {[
            ["Toyota Vitz", "Everyday trips", "toyota-vitz.jpg"],
            ["Toyota Voxy", "A little extra room", "toyota-voxy.jpg"],
            ["Nissan Caravan", "Go together", "nissan-caravan.jpg"],
          ].map(([name, note, image]) => (
            <div className="mini-fleet" key={name}>
              <img src={`/images/${image}`} alt={name} />
              <div>
                <strong>{name}</strong>
                <p>{note}</p>
              </div>
            </div>
          ))}
        </section>
        <section className="panel help-panel">
          <h3>How your booking works</h3>
          <p>
            1. Tell us where and when.
            <br />
            2. We assign an available driver.
            <br />
            3. Follow your journey in My rides.
          </p>
          <a href="tel:+233257160074">
            <Icon name="phone" size={15} />
            Need help? Call ELOCAB
          </a>
        </section>
      </aside>
    </div>
  );
}
export default function CustomerDashboard() {
  const { user } = useAuth();
  const {
    profile,
    bookings = [],
    loading,
    error,
    refresh,
  } = useDashboardData({
    profile: "/api/customers/profile",
    bookings: "/api/customers/bookings",
  });
  const { run, busy } = useAction();
  const tabs = [
    { id: "book", label: "Book a ride", mobileLabel: "Book", icon: "plus" },
    { id: "rides", label: "My rides", mobileLabel: "My rides", icon: "rides" },
    {
      id: "profile",
      label: "My profile",
      mobileLabel: "Profile",
      icon: "user",
    },
  ];
  const updateRide = async (ride, status) => {
    const r = await run(
      () => axios.put(`/api/customers/bookings/${ride._id}/cancel`),
      "Ride cancelled.",
    );
    if (r.ok) await refresh();
    return r.ok;
  };
  return (
    <DashboardShell role="customer" tabs={tabs} profileName={profile?.name}>
      {({ tab, go }) => (
        <>
          <PageHeading
            eyebrow="YOUR JOURNEY, YOUR WAY"
            title={
              tab === "book"
                ? `Where are we heading, ${(profile?.name || user.profile?.name || "traveller").split(" ")[0]}?`
                : tab === "rides"
                  ? "Every journey, in one place."
                  : "A little more about you."
            }
            text={
              tab === "book"
                ? "Everyday trips or bigger plans. Your next ride starts here."
                : tab === "rides"
                  ? "Follow upcoming rides and look back on the places you’ve been."
                  : "Keep your details current for a smoother journey."
            }
          >
            {tab === "rides" && (
              <Button onClick={() => go("book")}>
                <Icon name="plus" size={16} />
                Book a ride
              </Button>
            )}
          </PageHeading>
          <ErrorBanner message={error} onRetry={refresh} />
          {loading ? (
            <LoadingState />
          ) : (
            profile && (
              <>
                {tab === "book" && (
                  <>
                    <div className="stats-grid three">
                      <Stat
                        label="Your journeys"
                        value={bookings.length}
                        icon="rides"
                      />
                      <Stat
                        label="Upcoming & active"
                        value={
                          bookings.filter(
                            (b) =>
                              !["completed", "cancelled"].includes(b.status),
                          ).length
                        }
                        icon="clock"
                      />
                      <Stat
                        label="Completed rides"
                        value={
                          bookings.filter((b) => b.status === "completed")
                            .length
                        }
                        icon="check"
                      />
                    </div>
                    <BookingForm
                      onBooked={async () => {
                        await refresh();
                        go("rides");
                      }}
                    />
                  </>
                )}
                {tab === "rides" && (
                  <RideList
                    bookings={bookings}
                    onAction={updateRide}
                    busy={busy}
                    emptyAction={
                      <Button onClick={() => go("book")}>
                        Plan your first ride <Icon name="arrow" size={16} />
                      </Button>
                    }
                  />
                )}{" "}
                {tab === "profile" && (
                  <ProfileForm
                    key={profile._id}
                    profile={profile}
                    role="customer"
                    onSaved={refresh}
                  />
                )}
              </>
            )
          )}
        </>
      )}
    </DashboardShell>
  );
}
