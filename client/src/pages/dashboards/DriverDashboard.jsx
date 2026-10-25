import axios from "axios";
import DashboardShell from "../../components/DashboardShell";
import RideList from "../../components/RideList";
import ProfileForm from "../../components/ProfileForm";
import {
  PageHeading,
  Stat,
  Button,
  Icon,
  ErrorBanner,
  LoadingState,
} from "../../components/ui";
import useDashboardData from "../../hooks/useDashboardData";
import useAction from "../../hooks/useAction";
export default function DriverDashboard() {
  const {
    profile,
    bookings = [],
    loading,
    error,
    refresh,
  } = useDashboardData({
    profile: "/api/drivers/profile",
    bookings: "/api/drivers/bookings",
  });
  const { run, busy } = useAction();
  const active = bookings.filter(
    (b) => !["completed", "cancelled"].includes(b.status),
  );
  const history = bookings.filter((b) =>
    ["completed", "cancelled"].includes(b.status),
  );
  const tabs = [
    {
      id: "rides",
      label: "Assigned rides",
      mobileLabel: "Rides",
      icon: "car",
      count: active.length,
    },
    {
      id: "history",
      label: "Ride history",
      mobileLabel: "History",
      icon: "rides",
    },
    {
      id: "profile",
      label: "My profile",
      mobileLabel: "Profile",
      icon: "user",
    },
  ];
  const toggle = async () => {
    const r = await run(
      () => axios.post("/api/drivers/toggle-availability"),
      profile?.isAvailable
        ? "You’re offline."
        : "You’re online and ready for rides.",
    );
    if (r.ok) await refresh();
  };
  const updateRide = async (ride, status) => {
    const r = await run(
      () =>
        status === "accepted"
          ? axios.post(`/api/drivers/bookings/${ride._id}/accept`)
          : axios.put(`/api/drivers/bookings/${ride._id}/status`, { status }),
      "Ride updated.",
    );
    if (r.ok) await refresh();
    return r.ok;
  };
  return (
    <DashboardShell role="driver" tabs={tabs} profileName={profile?.name}>
      {({ tab }) => (
        <>
          <PageHeading
            eyebrow="YOUR ROAD. YOUR SCHEDULE."
            title={
              tab === "rides"
                ? `Ready for the road, ${(profile?.name || "driver").split(" ")[0]}?`
                : tab === "history"
                  ? "The journeys behind you."
                  : "You and your vehicle."
            }
            text={
              tab === "rides"
                ? "Manage your availability and give every journey a great start."
                : tab === "history"
                  ? "Your completed and cancelled rides, all together."
                  : "Keep your driver and vehicle details up to date."
            }
          >
            {tab !== "profile" && profile && (
              <button
                type="button"
                className={`availability-switch ${profile.isAvailable ? "" : "offline"}`}
                role="switch"
                aria-label="Driver availability"
                aria-checked={profile.isAvailable}
                disabled={busy || !profile.isActive}
                onClick={toggle}
              >
                <span className="switch-track" />
                {profile.isAvailable ? "You’re online" : "You’re offline"}
              </button>
            )}
          </PageHeading>
          <ErrorBanner message={error} onRetry={refresh} />
          {loading ? (
            <LoadingState />
          ) : (
            profile && (
              <>
                {tab !== "profile" && (
                  <div className="stats-grid three">
                    <Stat
                      label="Assigned & active"
                      value={active.length}
                      icon="car"
                    />
                    <Stat
                      label="Completed rides"
                      value={profile.totalRides || 0}
                      icon="check"
                    />
                    <Stat
                      label="Your vehicle"
                      value={profile.carType}
                      icon="users"
                      note={`${profile.numberOfSeats} passenger seats · ${profile.carNumber}`}
                    />
                  </div>
                )}
                {tab === "rides" && (
                  <>
                    {!profile.isAvailable && (
                      <div className="upcoming-callout">
                        <div>
                          <h3>A good day starts with going online.</h3>
                          <p>
                            Let the ELOCAB team know you're ready to receive
                            assignments.
                          </p>
                        </div>
                        <Button busy={busy} onClick={toggle}>
                          Go online <Icon name="arrow" size={16} />
                        </Button>
                      </div>
                    )}
                    <RideList
                      role="driver"
                      bookings={active}
                      onAction={updateRide}
                      busy={busy}
                    />
                  </>
                )}
                {tab === "history" && (
                  <RideList role="driver" bookings={history} readOnly />
                )}
                {tab === "profile" && (
                  <ProfileForm
                    key={profile._id}
                    profile={profile}
                    role="driver"
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
