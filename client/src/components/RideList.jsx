import { useState } from "react";
import { Button, Icon, Modal, EmptyState, StatusBadge, formatDate } from "./ui";
const stages = [
  "pending",
  "assigned",
  "accepted",
  "on-the-way",
  "picked-up",
  "completed",
];
const next = {
  assigned: ["accepted", "Accept ride"],
  accepted: ["on-the-way", "Start pickup"],
  "on-the-way": ["picked-up", "Passenger picked up"],
  "picked-up": ["completed", "Complete ride"],
};
export default function RideList({
  bookings = [],
  role = "customer",
  onAction,
  onAssign,
  busy = false,
  emptyAction,
  compact = false,
  readOnly = false,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const selected = bookings.find((b) => b._id === selectedId);
  const visible = bookings.filter(
    (b) =>
      (status === "all" || b.status === status) &&
      [
        b.pickupPoint,
        b.destination,
        b.customerId?.name,
        b.customerId?.phoneNumber,
        b.driverId?.name,
        b.driverId?.carNumber,
        b._id,
      ].some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
  );
  const act = async () => {
    if (await onAction?.(confirm.booking, confirm.status)) setConfirm(null);
  };
  return (
    <>
      {!compact && (
        <div className="toolbar">
          <div className="search-field">
            <Icon name="search" />
            <input
              className="input"
              aria-label="Search rides"
              placeholder="Search routes, people, or ride IDs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input"
            aria-label="Filter rides by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {[...stages, "cancelled"].map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("-", " ")}
              </option>
            ))}
          </select>
          <span className="filter-count">
            {visible.length} {visible.length === 1 ? "ride" : "rides"}
          </span>
        </div>
      )}
      {!visible.length ? (
        <EmptyState
          title={
            search || status !== "all"
              ? "No matching rides"
              : "Your next journey is ahead"
          }
          text={
            search || status !== "all"
              ? "Try another search or status filter."
              : role === "driver"
                ? "Assigned rides will appear here. Go online when you’re ready."
                : role === "admin"
                  ? "New customer requests will appear here, ready for a driver."
                  : "Make a booking and follow every step of your journey here."
          }
        >
          {search || status !== "all" ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          ) : (
            emptyAction
          )}
        </EmptyState>
      ) : (
        <div className="ride-list">
          {visible.map((b) => (
            <article
              className="ride-card"
              key={b._id}
              aria-label={`Ride from ${b.pickupPoint} to ${b.destination}`}
            >
              <div className="ride-card-main">
                <div className="ride-route">
                  <div>
                    <small>Pickup</small>
                    <strong>{b.pickupPoint}</strong>
                  </div>
                  <div>
                    <small>Destination</small>
                    <strong>{b.destination}</strong>
                  </div>
                </div>
                <div className="ride-meta">
                  <span>
                    <Icon name="clock" size={14} />
                    {formatDate(b.dateTime)}
                  </span>
                  <span>
                    <Icon name="users" size={14} />
                    {b.numberOfPeople}{" "}
                    {b.numberOfPeople === 1 ? "passenger" : "passengers"} ·{" "}
                    {b.serviceType}
                  </span>
                  {role !== "customer" && (
                    <span>
                      <Icon name="user" size={14} />
                      {b.customerId?.name || "Customer account removed"}
                    </span>
                  )}
                </div>
                <div className="ride-card-actions">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedId(b._id)}
                  >
                    Details
                  </Button>
                  {!readOnly &&
                    onAssign &&
                    ["pending", "assigned"].includes(b.status) && (
                      <Button onClick={() => onAssign(b)} disabled={busy}>
                        {b.driverId ? "Change driver" : "Assign driver"}
                      </Button>
                    )}
                  {!readOnly &&
                    onAction &&
                    role !== "customer" &&
                    next[b.status] && (
                      <Button
                        disabled={busy}
                        onClick={() =>
                          setConfirm({
                            booking: b,
                            status: next[b.status][0],
                            label: next[b.status][1],
                          })
                        }
                      >
                        {next[b.status][1]}
                      </Button>
                    )}
                  {!readOnly &&
                    onAction &&
                    ["pending", "assigned", "accepted", "on-the-way"].includes(
                      b.status,
                    ) && (
                      <Button
                        variant="text"
                        disabled={busy}
                        onClick={() =>
                          setConfirm({
                            booking: b,
                            status: "cancelled",
                            label: "Cancel ride",
                          })
                        }
                      >
                        Cancel ride
                      </Button>
                    )}
                </div>
              </div>
              <div className="ride-card-footer">
                <StatusBadge status={b.status} />
                {b.driverId ? (
                  <span className="ride-contact">
                    <Icon name="car" size={14} />
                    {b.driverId.name} · {b.driverId.carType}
                  </span>
                ) : (
                  <span>Waiting for a driver</span>
                )}
                <span>#{b._id?.slice(-6).toUpperCase()}</span>
              </div>
            </article>
          ))}
        </div>
      )}
      <Modal
        open={!!selected}
        title="Your ride details"
        onClose={() => setSelectedId(null)}
      >
        <StatusBadge status={selected?.status} />
        {selected && (
          <>
            {selected.status !== "cancelled" && (
              <div className="ride-timeline" aria-label="Ride progress">
                {stages.map((s, i) => (
                  <div
                    key={s}
                    className={`timeline-step ${stages.indexOf(selected.status) >= i ? "done" : ""}`}
                  >
                    <span>
                      {stages.indexOf(selected.status) > i ? (
                        <Icon name="check" size={11} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    {s.replaceAll("-", " ")}
                  </div>
                ))}
              </div>
            )}
            <dl className="detail-grid">
              <div>
                <dt>Pickup</dt>
                <dd>{selected.pickupPoint}</dd>
              </div>
              <div>
                <dt>Destination</dt>
                <dd>{selected.destination}</dd>
              </div>
              <div>
                <dt>Travel date & time</dt>
                <dd>{formatDate(selected.dateTime)}</dd>
              </div>
              <div>
                <dt>Journey</dt>
                <dd>
                  {selected.serviceType} · {selected.numberOfPeople} passengers
                </dd>
              </div>
              {role !== "customer" && (
                <div>
                  <dt>Customer</dt>
                  <dd>
                    {selected.customerId?.name || "Account removed"}
                    {selected.customerId?.phoneNumber && (
                      <>
                        <br />
                        <a
                          className="text-link"
                          href={`tel:${selected.customerId.phoneNumber}`}
                        >
                          <Icon name="phone" size={13} />
                          {selected.customerId.phoneNumber}
                        </a>
                      </>
                    )}
                  </dd>
                </div>
              )}
              <div>
                <dt>Driver</dt>
                <dd>
                  {selected.driverId?.name || "Not assigned yet"}
                  {selected.driverId?.contactNumber && (
                    <>
                      <br />
                      <a
                        className="text-link"
                        href={`tel:${selected.driverId.contactNumber}`}
                      >
                        <Icon name="phone" size={13} />
                        {selected.driverId.contactNumber}
                      </a>
                    </>
                  )}
                </dd>
              </div>
              {selected.driverId && (
                <div>
                  <dt>Vehicle</dt>
                  <dd>
                    {selected.driverId.carType}
                    <br />
                    {selected.driverId.carNumber}
                  </dd>
                </div>
              )}
              <div className="detail-wide">
                <dt>Booking notes</dt>
                <dd>{selected.notes || "No additional notes."}</dd>
              </div>
            </dl>
          </>
        )}
      </Modal>
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.label || "Update ride"}
        busy={busy}
      >
        <p className="modal-description">
          {confirm?.status === "cancelled"
            ? "Cancel this journey? The customer, driver, and ELOCAB team will be updated. This cannot be undone."
            : `Confirm this ride is ready to move to ${confirm?.status?.replaceAll("-", " ")}.`}
        </p>
        <div className="modal-actions">
          <Button
            variant="outline"
            onClick={() => setConfirm(null)}
            disabled={busy}
          >
            Go back
          </Button>
          <Button
            variant={confirm?.status === "cancelled" ? "danger" : "primary"}
            busy={busy}
            onClick={act}
          >
            {confirm?.label}
          </Button>
        </div>
      </Modal>
    </>
  );
}
