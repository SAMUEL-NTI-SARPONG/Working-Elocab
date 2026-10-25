import { useState } from "react";
import toast from "react-hot-toast";
import { Button, Icon } from "./ui";
export default function NotificationPreferences() {
  const supported = typeof Notification !== "undefined";
  const [enabled, setEnabled] = useState(
    supported &&
      Notification.permission === "granted" &&
      localStorage.getItem("elocab_desktop_alerts") === "true",
  );
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    if (enabled) {
      localStorage.setItem("elocab_desktop_alerts", "false");
      setEnabled(false);
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        localStorage.setItem("elocab_desktop_alerts", "true");
        setEnabled(true);
        toast.success("Desktop alerts enabled.");
      } else
        toast.error(
          "Alerts are blocked. You can allow notifications in your browser’s site settings.",
        );
    } catch {
      toast.error("Your browser could not enable desktop alerts.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Stay in the loop</h2>
          <p>Choose how you hear about your journeys.</p>
        </div>
        <Icon name="bell" />
      </div>
      <p className="account-note">
        {supported
          ? "Get desktop alerts for new assignments and ride updates while ELOCAB is open. Notifications also stay in your inbox."
          : "Desktop alerts are not supported by this browser. You can still read every update in your notification inbox."}
      </p>
      <div className="form-actions" style={{ marginTop: 18 }}>
        <Button
          variant="outline"
          busy={busy}
          disabled={!supported}
          onClick={toggle}
        >
          {enabled ? "Turn off desktop alerts" : "Enable desktop alerts"}
        </Button>
      </div>
    </section>
  );
}
