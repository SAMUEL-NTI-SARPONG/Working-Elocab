import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth, errorMessage } from "../context/AuthContext";
import useDashboardData from "../hooks/useDashboardData";
import {
  Brand,
  Icon,
  Button,
  Modal,
  EmptyState,
  ErrorBanner,
  formatDate,
} from "./ui";

function Notifications({ onViewRides }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { items, error, refresh } = useDashboardData({
    items: "/api/notifications?limit=50",
  });
  const mutate = async (url, method = "put") => {
    setBusy(true);
    try {
      await axios[method](url);
      await refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button
        type="button"
        className="icon-button notification-button"
        aria-label={`Notifications${items?.unreadCount ? `, ${items.unreadCount} unread` : ""}`}
        onClick={() => {
          setOpen(true);
          refresh();
        }}
      >
        <Icon name="bell" />
        {items?.unreadCount > 0 && <span className="notification-dot" />}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Your notifications"
        busy={busy}
      >
        <ErrorBanner message={error} onRetry={refresh} />
        {items?.notifications?.length ? (
          <>
            <div className="notification-actions">
              <Button
                variant="text"
                busy={busy}
                onClick={() => mutate("/api/notifications/mark-all-read")}
              >
                Mark all as read
              </Button>
            </div>
            <ul className="notification-list">
              {items.notifications.map((n) => (
                <li className={n.read ? "" : "unread"} key={n._id}>
                  <span className="notification-symbol">
                    <Icon name={n.type === "welcome" ? "user" : "car"} />
                  </span>
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <small>{formatDate(n.createdAt)}</small>
                    <div className="inline-actions">
                      {!n.read && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            mutate(`/api/notifications/${n._id}/read`)
                          }
                        >
                          Mark as read
                        </button>
                      )}
                      {n.data?.bookingId && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            onViewRides();
                          }}
                        >
                          View rides <Icon name="arrow" size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        aria-label={`Delete notification: ${n.title}`}
                        onClick={() =>
                          mutate(`/api/notifications/${n._id}`, "delete")
                        }
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState
            icon="bell"
            title="You're all caught up"
            text="Ride updates and account notifications will appear here."
          />
        )}
      </Modal>
    </>
  );
}

export default function DashboardShell({ role, tabs, children, profileName }) {
  const { user, logout } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = tabs.some((t) => t.id === params.get("tab"))
    ? params.get("tab")
    : tabs[0].id;
  const go = (id) => setParams(id === tabs[0].id ? {} : { tab: id });
  const name =
    profileName ||
    user.profile?.name ||
    (role === "admin" ? "Administrator" : "Your account");
  return (
    <div className="workspace">
      <a href="#workspace-content" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">
          {role === "customer"
            ? "Your journeys"
            : role === "driver"
              ? "Driver workspace"
              : "Operations workspace"}
        </div>
        <nav aria-label={`${role} navigation`}>
          {tabs.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`nav-item ${tab === t.id ? "active" : ""}`}
              aria-current={tab === t.id ? "page" : undefined}
              onClick={() => go(t.id)}
            >
              <Icon name={t.icon} />
              <span>{t.label}</span>
              {t.count > 0 && <span className="nav-count">{t.count}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-help">
          <span className="eyebrow">A little help?</span>
          <p>We're here for your journey.</p>
          <a href="tel:+233257160074">
            Contact ELOCAB <Icon name="arrow" size={16} />
          </a>
        </div>
        <div className="sidebar-bottom">
          <span className="online-indicator" />
          Kumasi, Ghana
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-header">
          <div className="mobile-brand">
            <Brand />
          </div>
          <div className="breadcrumb">
            <span>ELOCAB</span>
            <span>/</span>
            <strong>{tabs.find((t) => t.id === tab)?.label}</strong>
          </div>
          <div className="header-actions">
            <Notifications onViewRides={() => go("rides")} />
            <div className="account-avatar" aria-hidden="true">
              {name.slice(0, 1).toUpperCase()}
            </div>
            <div className="account-label">
              <strong>{name}</strong>
              <small>{role} account</small>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Sign out"
              title="Sign out"
              onClick={logout}
            >
              <Icon name="logout" />
            </button>
          </div>
        </header>
        <main id="workspace-content" className="workspace-content">
          {children({ tab, go })}
        </main>
        <footer className="workspace-footer">
          <span>© {new Date().getFullYear()} ELOCAB</span>
          <span>Your journey, our priority.</span>
        </footer>
      </div>
      <nav
        className="mobile-navigation"
        aria-label={`${role} mobile navigation`}
      >
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            aria-current={tab === t.id ? "page" : undefined}
            className={tab === t.id ? "active" : ""}
            onClick={() => go(t.id)}
          >
            <Icon name={t.icon} />
            <span>{t.mobileLabel || t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
