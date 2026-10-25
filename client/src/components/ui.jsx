import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";

const paths = {
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "M19 12H5m6-6-6 6 6 6",
  car: "m5 7 2-3h10l2 3m-16 3 2-3h14l2 3v8H3v-8Zm3 3h2m8 0h2M5 18v2m14-2v2",
  pin: "M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  check: "m5 12 4 4L19 6",
  clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  user: "M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-4M13 3a4 4 0 0 1 0 8M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  rides: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  logout: "M9 4H4v16h5m5-12 4 4-4 4m-6-4h13",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  plus: "M12 5v14M5 12h14",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  shield: "m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4Zm-4 10 3 3 5-6",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  phone: "m5 3 4 4-2 3c2 4 3 5 7 7l3-2 4 4c-4 6-10 2-15-3S-1 7 5 3Z",
  refresh:
    "M20 7v5h-5M4 17v-5h5m-4-5a8 8 0 0 1 14-2l1 2M4 17l1 2a8 8 0 0 0 14-2",
  archive: "M3 3h18v5H3zM5 8v13h14V8m-10 4h6",
};
export function Icon({ name = "arrow", size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.arrow} />
    </svg>
  );
}
export function Brand({ light = false }) {
  return (
    <Link
      className={`brand ${light ? "brand-light" : ""}`}
      to="/"
      aria-label="ELOCAB home"
    >
      <img src="/images/logo.png" alt="" />
      <span>
        ELOCAB<small>Your journey, our priority.</small>
      </span>
    </Link>
  );
}
export function Button({
  children,
  variant = "primary",
  className = "",
  busy = false,
  ...props
}) {
  return (
    <button
      type="button"
      className={`button button-${variant} ${className}`}
      aria-busy={busy || undefined}
      {...props}
      disabled={props.disabled || busy}
    >
      {busy && <span className="spinner" />}
      {children}
    </button>
  );
}
export function Field({
  label,
  hint,
  error,
  as: Tag = "input",
  children,
  ...props
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag
        id={id}
        className="input"
        aria-invalid={!!error || undefined}
        aria-describedby={hint || error ? `${id}-hint` : undefined}
        {...props}
      >
        {children}
      </Tag>
      {(hint || error) && (
        <small
          id={`${id}-hint`}
          className={error ? "field-error" : "field-hint"}
        >
          {error || hint}
        </small>
      )}
    </div>
  );
}
export function PasswordField({ label = "Password", ...props }) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input">
        <input
          className="input"
          id={id}
          type={visible ? "text" : "password"}
          required
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          <Icon name="eye" />
        </button>
      </div>
    </div>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
  busy = false,
  wide = false,
}) {
  const ref = useRef();
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="modal-body">
        <div className="modal-heading">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
            disabled={busy}
          >
            <Icon name="close" />
          </button>
        </div>
        {open && children}
      </div>
    </dialog>
  );
}
export function EmptyState({ icon = "rides", title, text, children }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={28} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
export function ErrorBanner({ message, onRetry }) {
  return message ? (
    <div className="error-banner" role="alert">
      <p>{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  ) : null;
}
export function LoadingState() {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" /> Loading your workspace…
    </div>
  );
}
export function StatusBadge({ status }) {
  return (
    <span className={`status status-${status}`}>
      <span />
      {status?.replaceAll("-", " ") || "Unknown"}
    </span>
  );
}
export function PageHeading({ eyebrow, title, text, children }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </div>
  );
}
export function Stat({ label, value, icon, note }) {
  return (
    <div className="stat">
      <div>
        <p>{label}</p>
        <strong>{value ?? "—"}</strong>
        {note && <small>{note}</small>}
      </div>
      <span className="stat-icon">
        <Icon name={icon} />
      </span>
    </div>
  );
}
export const formatDate = (value) =>
  value && Number.isFinite(new Date(value).getTime())
    ? new Intl.DateTimeFormat("en-GH", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Accra",
      }).format(new Date(value))
    : "Not specified";
export const vehicles = [
  "Toyota Vitz",
  "Toyota Voxy",
  "Toyota Hiace",
  "Nissan Caravan",
  "Other",
];
export function downloadJSON(data, name) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
