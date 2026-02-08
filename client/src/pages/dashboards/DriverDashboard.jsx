import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    baseLocation: "",
    carType: "",
    carNumber: "",
    licenseNumber: "",
    seats: "",
    contactNumber: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchBookings();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("/api/drivers/profile");
      setProfile(data);
      setProfileForm({
        name: data.name || "",
        baseLocation: data.baseLocation || "",
        carType: data.carType || "",
        carNumber: data.carNumber || "",
        licenseNumber: data.licenseNumber || "",
        seats: data.seats || "",
        contactNumber: data.contactNumber || "",
      });
    } catch (error) {
      toast.error("Failed to fetch profile");
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/drivers/bookings");
      setBookings(data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    }
  };

  const toggleAvailability = async () => {
    try {
      const { data } = await axios.post("/api/drivers/toggle-availability");
      toast.success(data.message);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to toggle availability");
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`/api/drivers/bookings/${bookingId}/status`, { status });
      toast.success("Booking status updated successfully!");
      fetchBookings();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update status";
      toast.error(errorMsg);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put("/api/drivers/profile", profileForm);
      toast.success("Profile updated successfully!");
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      accepted: "bg-cyan-100 text-cyan-800",
      "on-the-way": "bg-purple-100 text-purple-800",
      "picked-up": "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const activeBookings = bookings.filter(
    (b) => !["completed", "cancelled"].includes(b.status)
  );
  const completedBookings = bookings.filter((b) =>
    ["completed", "cancelled"].includes(b.status)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-secondary shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-white/10 scale-100 group-hover:scale-125 transition-all duration-300"></div>
                  <img
                    src="/images/logo.png"
                    alt="ELOCAB"
                    className="h-14 w-auto relative z-10 group-hover:scale-105 transition-all duration-500 drop-shadow-2xl"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white">ELOCAB</h1>
                  <p className="text-xs text-white/80">Driver Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleAvailability}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  profile?.isAvailable
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                }`}
              >
                {profile?.isAvailable ? "Online" : "Offline"}
              </button>
              <span className="text-white">{profile?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "bookings"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              My Rides
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "history"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "profile"
                  ? "border-secondary text-secondary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Active Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary mb-6">
              Assigned Rides
            </h2>

            {activeBookings.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500 text-lg mb-2">
                  {profile?.isAvailable
                    ? "You're online. We'll notify you when a ride is assigned."
                    : "Turn on availability to receive ride assignments."}
                </p>
                {!profile?.isAvailable && (
                  <button
                    onClick={toggleAvailability}
                    className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-all"
                  >
                    Go Online Now
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((booking) => (
                  <div key={booking._id} className="card border-l-4 border-secondary">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {booking.serviceType}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {new Date(booking.dateTime).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace("-", " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          Pickup Point
                        </p>
                        <p className="font-bold text-gray-800 mt-1">
                          {booking.pickupPoint}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          Destination
                        </p>
                        <p className="font-bold text-gray-800 mt-1">
                          {booking.destination}
                        </p>
                      </div>
                    </div>

                    {booking.customerId && (
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4">
                        <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                          Customer Details
                        </p>
                        <p className="font-bold text-gray-800">
                          {booking.customerId.name}
                        </p>
                        <p className="text-secondary font-semibold text-sm">
                          {booking.customerId.phoneNumber}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {booking.numberOfPeople}{" "}
                          {booking.numberOfPeople > 1 ? "people" : "person"}
                        </p>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4">
                        <p className="text-sm font-semibold text-amber-700">
                          Special Note:
                        </p>
                        <p className="text-gray-700 mt-1">{booking.notes}</p>
                      </div>
                    )}

                    {/* Status Update Buttons */}
                    <div className="flex gap-3 flex-wrap pt-4 border-t border-gray-200">
                      {booking.status === "assigned" && (
                        <>
                          <button
                            onClick={() =>
                              updateBookingStatus(booking._id, "accepted")
                            }
                            className="flex-1 min-w-[140px] px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-all"
                          >
                            Accept Ride
                          </button>
                          <button
                            onClick={() =>
                              updateBookingStatus(booking._id, "cancelled")
                            }
                            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-all"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {booking.status === "accepted" && (
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id, "on-the-way")
                          }
                          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-all"
                        >
                          On The Way
                        </button>
                      )}
                      {booking.status === "on-the-way" && (
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id, "picked-up")
                          }
                          className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-all"
                        >
                          Picked Up
                        </button>
                      )}
                      {booking.status === "picked-up" && (
                        <button
                          onClick={() =>
                            updateBookingStatus(booking._id, "completed")
                          }
                          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all"
                        >
                          Complete Ride
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-6">
              Ride History ({completedBookings.length} total)
            </h2>

            {completedBookings.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">Your completed rides will appear here</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-primary to-primary-light text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Service Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Route</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Passengers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {completedBookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                booking.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {booking.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-800">
                            {booking.serviceType}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {new Date(booking.dateTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="text-gray-800">{booking.pickupPoint}</div>
                              <div className="text-gray-500 text-xs">→ {booking.destination}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {booking.numberOfPeople}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4 p-4">
                  {completedBookings.map((booking) => (
                    <div key={booking._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(booking.dateTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-500">Service:</span> <span className="ml-2 font-semibold">{booking.serviceType}</span></div>
                        <div><span className="text-gray-500">From:</span> <span className="ml-2">{booking.pickupPoint}</span></div>
                        <div><span className="text-gray-500">To:</span> <span className="ml-2">{booking.destination}</span></div>
                        <div><span className="text-gray-500">Passengers:</span> <span className="ml-2">{booking.numberOfPeople}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <h2 className="text-2xl font-bold text-secondary mb-6">
                Driver Profile
              </h2>

              {!editMode ? (
                <div>
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-gray-600 text-sm">Name</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Email</p>
                      <p className="text-gray-800 font-semibold">
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Base Location</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.baseLocation || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Car Type</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.carType || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Car Number</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.carNumber || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">License Number</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.licenseNumber || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Seats</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.seats || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Contact Number</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.contactNumber || "Not set"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full btn-secondary"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="input-field"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Base Location
                    </label>
                    <input
                      type="text"
                      value={profileForm.baseLocation}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          baseLocation: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="e.g., KNUST"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Car Type
                    </label>
                    <input
                      type="text"
                      value={profileForm.carType}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          carType: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="e.g., Toyota Corolla"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Car Number
                    </label>
                    <input
                      type="text"
                      value={profileForm.carNumber}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          carNumber: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="e.g., GH-1234-21"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={profileForm.licenseNumber}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          licenseNumber: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="Your license number"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Seats
                    </label>
                    <input
                      type="number"
                      value={profileForm.seats}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, seats: e.target.value })
                      }
                      className="input-field"
                      placeholder="Number of seats"
                      min="1"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.contactNumber}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          contactNumber: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="Your contact number"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 btn-secondary disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Update Profile"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setProfileForm({
                          name: profile?.name || "",
                          baseLocation: profile?.baseLocation || "",
                          carType: profile?.carType || "",
                          carNumber: profile?.carNumber || "",
                          licenseNumber: profile?.licenseNumber || "",
                          seats: profile?.seats || "",
                          contactNumber: profile?.contactNumber || "",
                        });
                      }}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
