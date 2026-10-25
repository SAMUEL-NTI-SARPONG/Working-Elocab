import { useState } from "react";
import { Button, Field, PasswordField, Icon, vehicles } from "./ui";
export default function AccountForm({ role, onSubmit, busy }) {
  const [values, setValues] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    city: "Kumasi",
    digitalAddress: "",
    baseLocation: "",
    carType: "Toyota Vitz",
    carNumber: "",
    licenseNumber: "",
    seats: 4,
  });
  const change = (e) =>
    setValues({ ...values, [e.target.name]: e.target.value });
  return (
    <form
      className="form-stack"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...values, seats: Number(values.seats) });
      }}
    >
      <div className="form-grid">
        <Field
          label="Full name"
          name="name"
          required
          value={values.name}
          onChange={change}
        />
        <Field
          label="Phone number"
          name="phoneNumber"
          type="tel"
          required
          value={values.phoneNumber}
          onChange={change}
        />
        {role === "customer" ? (
          <>
            <Field
              label="City"
              name="city"
              required
              value={values.city}
              onChange={change}
            />
            <Field
              label="Digital address"
              name="digitalAddress"
              value={values.digitalAddress}
              onChange={change}
            />
          </>
        ) : (
          <>
            <Field
              label="Base location"
              name="baseLocation"
              required
              value={values.baseLocation}
              onChange={change}
            />
            <Field
              label="Vehicle type"
              as="select"
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
              value={values.carNumber}
              onChange={change}
            />
            <Field
              label="Licence number"
              name="licenseNumber"
              required
              value={values.licenseNumber}
              onChange={change}
            />
            <Field
              label="Passenger seats"
              name="seats"
              type="number"
              min="2"
              max="30"
              step="1"
              required
              value={values.seats}
              onChange={change}
            />
          </>
        )}
      </div>
      <PasswordField
        label="Temporary password"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        name="password"
        value={values.password}
        onChange={change}
      />
      <p className="account-note">
        Share these sign-in details with the account holder privately. Driver
        accounts start offline so they can choose when to receive rides.
      </p>
      <Button type="submit" busy={busy}>
        Create {role} <Icon name="plus" size={16} />
      </Button>
    </form>
  );
}
