import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import {
  Button,
  Field,
  PasswordField,
  ErrorBanner,
  Icon,
  vehicles,
} from "../components/ui";
import { useAuth, homeFor, errorMessage } from "../context/AuthContext";
export default function RegisterPage() {
  const [params, setParams] = useSearchParams();
  const role = params.get("role") === "driver" ? "driver" : "customer";
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    city: "Kumasi",
    digitalAddress: "",
    baseLocation: "",
    carType: "Toyota Vitz",
    carNumber: "",
    licenseNumber: "",
    seats: 4,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = (e) =>
    setValues({ ...values, [e.target.name]: e.target.value });
  if (!loading && user) return <Navigate to={homeFor(user.role)} replace />;
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (values.password !== values.confirmPassword) {
      setError("Your passwords do not match. Please check them and try again.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const account = await register({
        ...values,
        confirmPassword: undefined,
        role,
        seats: Number(values.seats),
      });
      navigate(homeFor(account.role), { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout
      driver={role === "driver"}
      eyebrow="Make your move"
      title={
        role === "driver"
          ? "A new road to opportunity."
          : "Good journeys start here."
      }
      text={
        role === "driver"
          ? "Join ELOCAB and manage rides on your schedule."
          : "Create your account for rides across Kumasi."
      }
    >
      <div className="role-picker" role="group" aria-label="Account type">
        {[
          ["customer", "Book a ride", "car"],
          ["driver", "Become a driver", "user"],
        ].map(([id, label, icon]) => (
          <button
            type="button"
            key={id}
            aria-pressed={role === id}
            className={role === id ? "selected" : ""}
            onClick={() => {
              setParams({ role: id }, { replace: true });
              setError("");
            }}
          >
            <Icon name={icon} />
            {label}
            {role === id && <Icon name="check" size={16} />}
          </button>
        ))}
      </div>
      <form className="form-stack" onSubmit={submit}>
        <ErrorBanner message={error} />
        <div className="form-grid">
          <Field
            label="Full name"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            value={values.name}
            onChange={change}
          />
          <Field
            label="Phone number"
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            required
            placeholder="024 123 4567"
            value={values.phoneNumber}
            onChange={change}
          />
        </div>
        {role === "customer" ? (
          <div className="form-grid">
            <Field
              label="City"
              name="city"
              autoComplete="address-level2"
              required
              value={values.city}
              onChange={change}
            />
            <Field
              label="Digital address"
              name="digitalAddress"
              placeholder="Optional"
              value={values.digitalAddress}
              onChange={change}
            />
          </div>
        ) : (
          <>
            <div className="form-section-label">Your vehicle details</div>
            <div className="form-grid">
              <Field
                label="Base location"
                name="baseLocation"
                required
                value={values.baseLocation}
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
            </div>
          </>
        )}
        <div className="form-grid">
          <PasswordField
            autoComplete="new-password"
            name="password"
            minLength={8}
            maxLength={72}
            placeholder="At least 8 characters"
            value={values.password}
            onChange={change}
          />
          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={change}
          />
        </div>
        <Button type="submit" busy={busy} className="button-full">
          {busy ? "Creating your account…" : "Create account"}
          <Icon name="arrow" size={18} />
        </Button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
