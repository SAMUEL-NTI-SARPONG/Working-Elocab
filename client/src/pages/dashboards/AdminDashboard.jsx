import NotificationPreferences from "../../components/NotificationPreferences";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import DashboardShell from "../../components/DashboardShell";
import RideList from "../../components/RideList";
import AccountForm from "../../components/AccountForm";
import {
  PageHeading,
  Stat,
  Icon,
  Button,
  Field,
  Modal,
  EmptyState,
  ErrorBanner,
  LoadingState,
  formatDate,
  downloadJSON,
} from "../../components/ui";
import useDashboardData from "../../hooks/useDashboardData";
import useAction from "../../hooks/useAction";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
function People({ people, role, onCreate, onDelete, onToggle, busy }) {
  const [search, setSearch] = useState("");
  const filtered = people.filter((p) =>
    [
      p.name,
      p.phoneNumber,
      p.contactNumber,
      p.carNumber,
      p.baseLocation,
      p.city,
    ].some((v) =>
      String(v || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );
  return (
    <>
      <div className="toolbar">
        <div className="search-field">
          <Icon name="search" />
          <input
            className="input"
            aria-label={`Search ${role}s`}
            placeholder={`Search ${role}s by name, phone or location`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="filter-count">
          {filtered.length} {role}
          {filtered.length !== 1 ? "s" : ""}
        </span>
      </div>
      {filtered.length ? (
        <div className="people-list">
          {filtered.map((p) => (
            <article className="person-row" key={p._id}>
              <div className="person-name">
                <span className="account-avatar">{p.name.slice(0, 1)}</span>
                <div>
                  <strong>{p.name}</strong>
                  <small>
                    {p.baseLocation || p.city || "Kumasi"}
                    {role === "driver" &&
                      ` · ${p.isActive ? (p.isAvailable ? "Online" : "Offline") : "Inactive"}`}
                  </small>
                </div>
              </div>
              <div className="person-meta">
                <a href={`tel:${p.phoneNumber || p.contactNumber}`}>
                  {p.phoneNumber || p.contactNumber}
                </a>
                {role === "driver" ? (
                  <span>
                    {p.carType} · {p.carNumber}
                    <br />
                    {p.numberOfSeats} passenger seats · {p.totalRides || 0}{" "}
                    rides completed
                  </span>
                ) : (
                  <span>
                    {p.digitalAddress === "N/A"
                      ? "No digital address added"
                      : p.digitalAddress || "No digital address added"}
                  </span>
                )}
              </div>
              <div className="person-actions">
                {role === "driver" && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => onToggle(p)}
                  >
                    {p.isActive ? "Deactivate" : "Activate"}
                  </Button>
                )}
                <Button
                  variant="text"
                  disabled={busy}
                  onClick={() => onDelete(p)}
                >
                  Delete account
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="users"
          title={search ? "No matching people" : `No ${role}s yet`}
          text={
            search
              ? "Try another name, number, or location."
              : `Create a ${role} account to get started.`
          }
        >
          {search ? (
            <Button variant="outline" onClick={() => setSearch("")}>
              Clear search
            </Button>
          ) : (
            <Button onClick={onCreate}>
              Add {role} <Icon name="plus" size={16} />
            </Button>
          )}
        </EmptyState>
      )}
    </>
  );
}
function ActivityChart({ stats }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - 6 + i);
    const record = stats?.lifetime?.last7Days?.find(
      (d) =>
        new Date(d.date).toISOString().slice(0, 10) ===
        date.toISOString().slice(0, 10),
    );
    return { date, count: record?.bookingCount || 0 };
  });
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <h2>A week of journeys</h2>
          <p>Ride requests over the last seven days</p>
        </div>
        <Icon name="rides" />
      </div>
      <div
        className="chart-bars"
        role="img"
        aria-label={`Daily booking counts: ${days.map((d) => `${d.date.toLocaleDateString("en-GH", { weekday: "short", timeZone: "Africa/Accra" })} ${d.count}`).join(", ")}`}
      >
        {days.map((d) => (
          <div
            className="chart-bar"
            key={d.date.toISOString()}
            style={{ height: `${Math.max(3, (d.count / max) * 110)}px` }}
          >
            <span>{d.count}</span>
            <small>
              {d.date.toLocaleDateString("en-GH", {
                weekday: "short",
                timeZone: "Africa/Accra",
              })}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
function Settings({ refresh, action, confirm, busy }) {
  const {
    archiveStats,
    saved = [],
    error,
    refresh: reload,
  } = useDashboardData({
    archiveStats: "/api/admin/archive/stats",
    saved: "/api/admin/archive/saved",
  });
  const [preview, setPreview] = useState(null);
  const [imported, setImported] = useState(null);
  const [instruction, setInstruction] = useState(false);
  const { isInstalled, isInstallable, promptInstall } = useInstallPrompt();
  const previewArchive = async () => {
    const r = await action(() => axios.get("/api/admin/archive/preview"));
    if (r.ok) setPreview(r.data);
  };
  const archive = () =>
    confirm({
      title: "Archive old journeys?",
      message:
        "Completed and cancelled rides older than 90 days will be saved to a recoverable database archive, then removed from active ride records. You can download the archive again below.",
      label: "Archive and download",
      action: async () => {
        const { data } = await axios.post("/api/admin/archive/execute");
        if (data.data) downloadJSON(data.data, data.filename);
        await reload();
        await refresh();
        return { data };
      },
    });
  const importFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error("Choose an archive smaller than 10 MB.");
      const data = JSON.parse(await file.text());
      if (!data.exportDate || !Array.isArray(data.bookings))
        throw new Error("This file is not an ELOCAB archive.");
      const text = (v) => (typeof v === "string" ? v : "");
      const bookings = data.bookings.map((b, i) => {
        if (!b || typeof b !== "object")
          throw new Error("The archive contains an invalid ride.");
        const person = (p) =>
          p && typeof p === "object"
            ? Object.fromEntries(
                [
                  "name",
                  "phoneNumber",
                  "contactNumber",
                  "carType",
                  "carNumber",
                ].map((k) => [k, text(p[k])]),
              )
            : null;
        return {
          _id: text(b._id) || `archive-${i}`,
          pickupPoint: text(b.pickupPoint) || text(b.pickupLocation),
          destination: text(b.destination) || text(b.dropoffLocation),
          dateTime: text(b.dateTime),
          numberOfPeople: Number(b.numberOfPeople) || 1,
          serviceType: text(b.serviceType),
          status: text(b.status) || "unknown",
          notes: text(b.notes),
          customerId: person(b.customerId),
          driverId: person(b.driverId),
        };
      });
      setImported({ ...data, bookings });
      toast.success("Archive loaded.");
    } catch (e) {
      toast.error(
        e instanceof SyntaxError ? "This file is not valid JSON." : e.message,
      );
    } finally {
      event.target.value = "";
    }
  };
  return (
    <div className="settings-layout">
      <ErrorBanner message={error} onRetry={reload} />
      <div className="settings-two">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Journey archives</h2>
              <p>Keep older records safe and easy to find.</p>
            </div>
            <Icon name="archive" />
          </div>
          <div className="overview-activity">
            <div>
              <span>Ready to archive</span>
              <strong>{archiveStats?.archivable ?? "—"}</strong>
            </div>
            <div>
              <span>Recent completed / cancelled</span>
              <strong>{archiveStats?.recentCompleted ?? "—"}</strong>
            </div>
            <div>
              <span>Active journeys</span>
              <strong>{archiveStats?.active ?? "—"}</strong>
            </div>
          </div>
          <div className="modal-actions">
            <Button variant="outline" busy={busy} onClick={previewArchive}>
              Preview archive
            </Button>
            <Button
              disabled={busy || !archiveStats?.archivable}
              onClick={archive}
            >
              <Icon name="download" size={15} />
              Archive & download
            </Button>
          </div>
          {saved.length > 0 && (
            <>
              <div className="form-section-label section-space">
                Saved archives
              </div>
              {saved.map((a) => (
                <div className="settings-item" key={a._id}>
                  <div>
                    <h3>{formatDate(a.exportDate)}</h3>
                    <p>{a.totalBookings} rides · Recoverable archive</p>
                  </div>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={async () => {
                      const r = await action(() =>
                        axios.get(`/api/admin/archive/saved/${a._id}`),
                      );
                      if (r.ok)
                        downloadJSON(r.data, `elocab-archive-${a._id}.json`);
                    }}
                  >
                    <Icon name="download" size={14} />
                    Download
                  </Button>
                </div>
              ))}
            </>
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Open an archive</h2>
              <p>Review a previously downloaded ELOCAB archive.</p>
            </div>
            <Icon name="search" />
          </div>
          <label className="archive-file-label">
            Choose a JSON archive. Files stay in your browser.
            <input
              aria-label="Choose archive file"
              type="file"
              accept=".json,application/json"
              onChange={importFile}
            />
          </label>
          <div className="settings-item">
            <div>
              <h3>ELOCAB on your home screen</h3>
              <p>A quicker way back to your workspace.</p>
            </div>
            <Button
              variant="outline"
              disabled={isInstalled}
              onClick={async () => {
                if (isInstallable) await promptInstall();
                else setInstruction(true);
              }}
            >
              {isInstalled ? "Installed" : "Install app"}
            </Button>
          </div>
        </section>
      </div>
      <NotificationPreferences />
      <section className="panel danger-panel">
        <div className="panel-heading">
          <div>
            <h2>Data management</h2>
            <p>
              Review carefully. These actions permanently remove active records
              or reset counters.
            </p>
          </div>
          <Icon name="shield" />
        </div>
        {[
          [
            "Clear completed rides",
            "Remove completed and cancelled rides. Export a copy first.",
            "Clear completed",
            "/api/admin/bookings/clear-completed",
            "delete",
            "CLEAR",
          ],
          [
            "Clear all ride records",
            "Only available when every ride is completed or cancelled.",
            "Clear records",
            "/api/admin/bookings/clear-all",
            "delete",
            "CLEAR ALL",
          ],
          [
            "Reset lifetime statistics",
            "Reset booking, completion, cancellation, and activity counters. Ride records are retained.",
            "Reset statistics",
            "/api/admin/stats/reset",
            "post",
            "RESET",
          ],
        ].map(([title, message, label, url, method, word]) => (
          <div className="settings-item" key={url}>
            <div>
              <h3>{title}</h3>
              <p>{message}</p>
            </div>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                confirm({
                  title: `${title}?`,
                  message: `${message} This cannot be undone.`,
                  label,
                  requireType: word,
                  danger: true,
                  action: async () => {
                    const r = await axios[method](url);
                    await refresh();
                    await reload();
                    return r;
                  },
                })
              }
            >
              {label}
            </Button>
          </div>
        ))}
      </section>
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Archive preview"
        wide
      >
        <p className="archive-count">
          {preview?.count || 0} rides older than 90 days are ready to archive.
        </p>
        <RideList role="admin" bookings={preview?.bookings || []} readOnly />
      </Modal>
      <Modal
        open={!!imported}
        onClose={() => setImported(null)}
        title="Archive viewer"
        wide
      >
        <p className="archive-count">
          {imported?.bookings.length || 0} rides · Exported{" "}
          {formatDate(imported?.exportDate)}
        </p>
        <RideList role="admin" bookings={imported?.bookings || []} readOnly />
      </Modal>
      <Modal
        open={instruction}
        onClose={() => setInstruction(false)}
        title="Install ELOCAB"
      >
        <p className="modal-description">
          Use your browser's Install app or Add to Home Screen option. On iPhone
          or iPad, open the site in Safari and use Share, then Add to Home
          Screen.
        </p>
        <Button onClick={() => setInstruction(false)}>Got it</Button>
      </Modal>
    </div>
  );
}
export default function AdminDashboard() {
  const {
    stats,
    drivers = [],
    customers = [],
    bookings = [],
    loading,
    error,
    refresh,
  } = useDashboardData({
    stats: "/api/admin/stats",
    drivers: "/api/admin/drivers",
    customers: "/api/admin/customers",
    bookings: "/api/admin/bookings",
  });
  const { run, busy } = useAction();
  const [assignment, setAssignment] = useState(null);
  const [driverId, setDriverId] = useState("");
  const [createRole, setCreateRole] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [typed, setTyped] = useState("");
  const pending = bookings.filter((b) => b.status === "pending");
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      mobileLabel: "Overview",
      icon: "grid",
    },
    {
      id: "rides",
      label: "All rides",
      mobileLabel: "Rides",
      icon: "rides",
      count: pending.length,
    },
    { id: "drivers", label: "Drivers", mobileLabel: "Drivers", icon: "car" },
    {
      id: "customers",
      label: "Customers",
      mobileLabel: "Customers",
      icon: "users",
    },
    {
      id: "settings",
      label: "Settings",
      mobileLabel: "Settings",
      icon: "settings",
    },
  ];
  const confirm = (c) => {
    setTyped("");
    setConfirmation(c);
  };
  const confirmAction = async () => {
    const r = await run(
      confirmation.action,
      confirmation.success || "Changes saved.",
    );
    if (r.ok) setConfirmation(null);
  };
  const updateRide = async (ride, status) => {
    const r = await run(
      () => axios.put(`/api/admin/bookings/${ride._id}/status`, { status }),
      "Ride updated.",
    );
    if (r.ok) await refresh();
    return r.ok;
  };
  const assign = async (e) => {
    e.preventDefault();
    const r = await run(
      () =>
        axios.post("/api/admin/bookings/assign", {
          bookingId: assignment._id,
          driverId,
        }),
      "Driver assigned. Waiting for their acceptance.",
    );
    if (r.ok) {
      setAssignment(null);
      await refresh();
    }
  };
  const addPerson = async (values) => {
    const r = await run(
      () =>
        axios.post(
          `/api/admin/${createRole === "driver" ? "drivers" : "customers"}`,
          values,
        ),
      `${createRole === "driver" ? "Driver" : "Customer"} account created.`,
    );
    if (r.ok) {
      setCreateRole(null);
      await refresh();
    }
  };
  const deletePerson = (role) => (person) =>
    confirm({
      title: `Delete ${person.name}'s account?`,
      message:
        "This permanently removes their profile, sign-in access, and notifications. Active rides must be resolved first. Historical ride records are retained.",
      label: "Delete account",
      requireType: "DELETE",
      danger: true,
      action: async () => {
        const r = await axios.delete(
          `/api/admin/${role === "driver" ? "drivers" : "customers"}/${person._id}`,
        );
        await refresh();
        return r;
      },
    });
  const toggleDriver = (person) =>
    confirm({
      title: `${person.isActive ? "Deactivate" : "Activate"} ${person.name}?`,
      message: person.isActive
        ? "This blocks sign-in and new assignments. Active rides must be resolved first."
        : "This restores sign-in access. The driver can choose when to go online.",
      label: person.isActive ? "Deactivate driver" : "Activate driver",
      action: async () => {
        const r = await axios.put(
          `/api/admin/drivers/${person._id}/toggle-status`,
        );
        await refresh();
        return r;
      },
    });
  const assignable = drivers.filter(
    (d) =>
      d.isActive &&
      d.isAvailable &&
      d.numberOfSeats >= (assignment?.numberOfPeople || 0),
  );
  return (
    <DashboardShell role="admin" tabs={tabs}>
      {({ tab, go }) => (
        <>
          <PageHeading
            eyebrow="A CLEARER VIEW OF YOUR DAY"
            title={
              {
                overview: "Good journeys start with you.",
                rides: "Every ride, moving together.",
                drivers: "The people behind the wheel.",
                customers: "Your growing community.",
                settings: "Keep things running smoothly.",
              }[tab]
            }
            text={
              {
                overview: "Your ELOCAB operations, all in one place.",
                rides:
                  "Manage requests, assign drivers, and follow every journey.",
                drivers: "Manage driver accounts, vehicles, and availability.",
                customers: "Create and manage the people riding with ELOCAB.",
                settings: "Manage records, archives, and your workspace.",
              }[tab]
            }
          >
            {["drivers", "customers"].includes(tab) ? (
              <Button
                onClick={() =>
                  setCreateRole(tab === "drivers" ? "driver" : "customer")
                }
              >
                <Icon name="plus" size={16} />
                Add {tab === "drivers" ? "driver" : "customer"}
              </Button>
            ) : (
              <Button variant="outline" disabled={busy} onClick={refresh}>
                <Icon name="refresh" size={15} />
                Refresh
              </Button>
            )}
          </PageHeading>
          <ErrorBanner message={error} onRetry={refresh} />
          {loading ? (
            <LoadingState />
          ) : (
            <>
              {tab === "overview" && (
                <>
                  <div className="stats-grid">
                    <Stat
                      label="Total journeys"
                      value={stats?.lifetime?.totalBookings ?? bookings.length}
                      icon="rides"
                      note="Lifetime ride requests"
                    />
                    <Stat
                      label="Awaiting a driver"
                      value={pending.length}
                      icon="clock"
                      note="Ready for assignment"
                    />
                    <Stat
                      label="Drivers online"
                      value={
                        drivers.filter((d) => d.isAvailable && d.isActive)
                          .length
                      }
                      icon="car"
                      note={`Of ${drivers.length} registered drivers`}
                    />
                    <Stat
                      label="Your customers"
                      value={customers.length}
                      icon="users"
                      note="Part of the ELOCAB community"
                    />
                  </div>
                  {pending.length > 0 && (
                    <div className="upcoming-callout">
                      <div>
                        <h3>
                          {pending.length}{" "}
                          {pending.length === 1 ? "journey is" : "journeys are"}{" "}
                          waiting for a driver.
                        </h3>
                        <p>
                          A little coordination goes a long way. Let's get them
                          moving.
                        </p>
                      </div>
                      <Button onClick={() => go("rides")}>
                        Manage requests <Icon name="arrow" size={16} />
                      </Button>
                    </div>
                  )}
                  <div className="admin-overview-grid">
                    <ActivityChart stats={stats} />
                    <section className="panel">
                      <div className="panel-heading">
                        <div>
                          <h2>The bigger picture</h2>
                          <p>Lifetime journey outcomes</p>
                        </div>
                        <Icon name="check" />
                      </div>
                      <div className="overview-activity">
                        <div>
                          <span>Completed journeys</span>
                          <strong>
                            {stats?.lifetime?.totalCompleted || 0}
                          </strong>
                        </div>
                        <div>
                          <span>Cancelled journeys</span>
                          <strong>
                            {stats?.lifetime?.totalCancelled || 0}
                          </strong>
                        </div>
                        <div>
                          <span>Currently in progress</span>
                          <strong>
                            {
                              bookings.filter((b) =>
                                [
                                  "accepted",
                                  "on-the-way",
                                  "picked-up",
                                ].includes(b.status),
                              ).length
                            }
                          </strong>
                        </div>
                      </div>
                    </section>
                  </div>
                  <section>
                    <div className="panel-heading">
                      <div>
                        <h2>Latest ride requests</h2>
                        <p>What's happening across your city.</p>
                      </div>
                      <Button variant="text" onClick={() => go("rides")}>
                        View all rides <Icon name="arrow" size={14} />
                      </Button>
                    </div>
                    <RideList
                      role="admin"
                      bookings={bookings.slice(0, 4)}
                      compact
                      readOnly
                    />
                  </section>
                </>
              )}
              {tab === "rides" && (
                <RideList
                  role="admin"
                  bookings={bookings}
                  onAction={updateRide}
                  busy={busy}
                  onAssign={(b) => {
                    setAssignment(b);
                    setDriverId(b.driverId?._id || "");
                  }}
                />
              )}
              {tab === "drivers" && (
                <People
                  role="driver"
                  people={drivers}
                  busy={busy}
                  onCreate={() => setCreateRole("driver")}
                  onDelete={deletePerson("driver")}
                  onToggle={toggleDriver}
                />
              )}{" "}
              {tab === "customers" && (
                <People
                  role="customer"
                  people={customers}
                  busy={busy}
                  onCreate={() => setCreateRole("customer")}
                  onDelete={deletePerson("customer")}
                />
              )}{" "}
              {tab === "settings" && (
                <Settings
                  refresh={refresh}
                  action={run}
                  confirm={confirm}
                  busy={busy}
                />
              )}
            </>
          )}
          <Modal
            open={!!assignment}
            title="Match a driver to this journey"
            onClose={() => setAssignment(null)}
            busy={busy}
          >
            <p className="modal-description">
              {assignment?.pickupPoint} → {assignment?.destination}
              <br />
              {assignment?.numberOfPeople} passengers ·{" "}
              {formatDate(assignment?.dateTime)}
            </p>
            {assignable.length ? (
              <form className="form-stack" onSubmit={assign}>
                <Field
                  as="select"
                  label="Available driver"
                  required
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                >
                  <option value="">Choose an online driver</option>
                  {assignable.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} · {d.carType} · {d.numberOfSeats} seats
                    </option>
                  ))}
                </Field>
                <p className="account-note">
                  Only active, online drivers with enough seats are listed. The
                  driver will need to accept the assignment.
                </p>
                <Button type="submit" busy={busy}>
                  Assign driver <Icon name="arrow" size={16} />
                </Button>
              </form>
            ) : (
              <EmptyState
                icon="car"
                title="No suitable drivers online"
                text="Ask a driver with enough seats to go online, then refresh your workspace."
              />
            )}
          </Modal>
          <Modal
            open={!!createRole}
            title={`Add a ${createRole || "new account"}`}
            onClose={() => setCreateRole(null)}
            busy={busy}
          >
            <AccountForm
              key={createRole}
              role={createRole}
              onSubmit={addPerson}
              busy={busy}
            />
          </Modal>
          <Modal
            open={!!confirmation}
            title={confirmation?.title || "Confirm change"}
            onClose={() => setConfirmation(null)}
            busy={busy}
          >
            <p className="modal-description">{confirmation?.message}</p>
            {confirmation?.requireType && (
              <Field
                label={`Type ${confirmation.requireType} to confirm`}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
              />
            )}
            <div className="modal-actions">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setConfirmation(null)}
              >
                Go back
              </Button>
              <Button
                variant={confirmation?.danger ? "danger" : "primary"}
                busy={busy}
                disabled={
                  !!confirmation?.requireType &&
                  typed !== confirmation.requireType
                }
                onClick={confirmAction}
              >
                {confirmation?.label || "Confirm"}
              </Button>
            </div>
          </Modal>
        </>
      )}
    </DashboardShell>
  );
}
