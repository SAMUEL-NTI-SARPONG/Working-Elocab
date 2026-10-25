import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import {
  Button,
  Field,
  PasswordField,
  ErrorBanner,
  Icon,
} from "../components/ui";
import { useAuth, homeFor, errorMessage } from "../context/AuthContext";
export function SignIn({ admin = false }) {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ identifier: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!loading && user) return <Navigate to={homeFor(user.role)} replace />;
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const account = await login(values.identifier, values.password, admin);
      navigate(homeFor(account.role), { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout
      eyebrow={admin ? "ELOCAB operations" : "Welcome back"}
      title={
        admin ? "Welcome to your workspace." : "Your next journey starts here."
      }
      text={
        admin
          ? "Sign in to manage rides, drivers, and customers."
          : "Sign in to book a ride or get back on the road."
      }
    >
      <form onSubmit={submit} className="form-stack">
        <ErrorBanner message={error} />
        <Field
          label={admin ? "Email address" : "Phone number"}
          name={admin ? "email" : "phoneNumber"}
          type={admin ? "email" : "tel"}
          autoComplete="username"
          placeholder={admin ? "you@example.com" : "e.g. 024 123 4567"}
          required
          value={values.identifier}
          onChange={(e) => setValues({ ...values, identifier: e.target.value })}
        />
        <PasswordField
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => setValues({ ...values, password: e.target.value })}
        />
        <Button type="submit" busy={busy} className="button-full">
          {busy ? "Signing in…" : "Sign in"}
          <Icon name="arrow" size={18} />
        </Button>
      </form>
      <p className="auth-switch">
        {admin ? (
          <Link to="/login">Customer or driver? Sign in here</Link>
        ) : (
          <>
            New to ELOCAB? <Link to="/register">Create an account</Link>
          </>
        )}
      </p>
      <div className="auth-help">
        <Icon name="shield" size={18} />
        <p>
          Need help signing in? <a href="tel:+233257160074">Contact ELOCAB</a>
        </p>
      </div>
    </AuthLayout>
  );
}
export default function LoginPage() {
  return <SignIn />;
}
