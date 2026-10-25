import NotificationPreferences from "./NotificationPreferences";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import useAction from "../hooks/useAction";
import { Button, Field, Icon, vehicles } from "./ui";
export default function ProfileForm({ profile, role, onSaved }) {
  const [values, setValues] = useState({ ...profile });
  const { user, updateUser } = useAuth();
  const { run, busy } = useAction();
  const change = (e) =>
    setValues({ ...values, [e.target.name]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    const r = await run(
      () =>
        axios.put(
          `/api/${role === "customer" ? "customers" : "drivers"}/profile`,
          values,
        ),
      "Profile updated.",
    );
    if (r.ok) {
      updateUser({
        profile: r.data,
        ...(role === "customer" ? { phoneNumber: r.data.phoneNumber } : {}),
      });
      await onSaved();
    }
  };
  return (
    <div className="profile-layout">
      <section className="panel">
        <div className="profile-card">
          <span className="account-avatar">{profile.name?.slice(0, 1)}</span>
          <div>
            <h2>{profile.name}</h2>
            <p>{role === "driver" ? "ELOCAB driver" : "ELOCAB customer"}</p>
          </div>
        </div>
        <form className="form-stack" onSubmit={save}>
          <div className="form-grid">
            <Field
              label="Full name"
              name="name"
              autoComplete="name"
              required
              value={values.name || ""}
              onChange={change}
            />
            <Field
              label={role === "customer" ? "Phone number" : "Contact number"}
              type="tel"
              name={role === "customer" ? "phoneNumber" : "contactNumber"}
              autoComplete="tel"
              required
              value={
                (role === "customer"
                  ? values.phoneNumber
                  : values.contactNumber) || ""
              }
              onChange={change}
            />
            {role === "customer" ? (
              <>
                <Field
                  label="City"
                  name="city"
                  required
                  value={values.city || ""}
                  onChange={change}
                />
                <Field
                  label="Digital address"
                  name="digitalAddress"
                  value={values.digitalAddress || ""}
                  onChange={change}
                />
              </>
            ) : (
              <>
                <Field
                  label="Base location"
                  name="baseLocation"
                  required
                  value={values.baseLocation || ""}
                  onChange={change}
                />
                <Field
                  as="select"
                  label="Vehicle type"
                  name="carType"
                  value={values.carType}
                  onChange={change}
                >
                  {vehicles.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </Field>
                <Field
                  label="Vehicle number"
                  name="carNumber"
                  required
                  value={values.carNumber || ""}
                  onChange={change}
                />
                <Field
                  label="Licence number"
                  name="licenseNumber"
                  required
                  value={values.licenseNumber || ""}
                  onChange={change}
                />
                <Field
                  label="Passenger seats"
                  type="number"
                  name="numberOfSeats"
                  min="2"
                  max="30"
                  step="1"
                  required
                  value={values.numberOfSeats}
                  onChange={change}
                />
              </>
            )}
          </div>
          <div className="form-actions">
            <Button type="submit" busy={busy}>
              Save changes <Icon name="check" size={16} />
            </Button>
          </div>
        </form>
      </section>
      <div className="booking-side">
        <section className="panel">
          <div className="panel-heading">
            <h2>Your account</h2>
            <Icon name="shield" />
          </div>
          <p className="account-note">
            {role === "customer"
              ? "Your phone number is also your sign-in ID. If you change it, use the new number the next time you sign in."
              : `Your sign-in number is ${user.phoneNumber}. Your contact number is the number customers can call for an assigned ride.`}
          </p>
        </section>
        <section className="panel help-panel">
          <h3>Need a hand?</h3>
          <p>
            For account access or help with a journey, get in touch with the
            ELOCAB team.
          </p>
          <a href="tel:+233257160074">
            <Icon name="phone" size={16} />
            025 716 0074
          </a>
        </section>
        <NotificationPreferences />
      </div>
    </div>
  );
}
