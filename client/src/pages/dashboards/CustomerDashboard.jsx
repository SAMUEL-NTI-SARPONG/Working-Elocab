import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import InstallPrompt from "../../components/InstallPrompt";
import NotificationBell from "../../components/NotificationBell";
import ConfirmModal from "../../components/ConfirmModal";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [activeTab, setActiveTab] = useState("book");
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    serviceType: "Dropping",
    dateTime: "",
    pickupPoint: "",
    destination: "",
    numberOfPeople: 1,
    notes: "",
  });
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    // Only show install prompt once per session
    const hasSeenThisSession = sessionStorage.getItem(
      "elocab_install_shown_this_session",
    );
    const hasDismissedForever = localStorage.getItem(
      "elocab_install_prompt_seen",
    );

    if (!hasSeenThisSession && !hasDismissedForever) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
        sessionStorage.setItem("elocab_install_shown_this_session", "true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchBookings();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("/api/customers/profile");
      setProfile(data);
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      }
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/customers/bookings");
      setBookings(data);
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.message || "Failed to fetch bookings",
        );
      }
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/customers/bookings", bookingForm);
      toast.success("Booking created successfully! We will contact you soon.");
      setBookingForm({
        serviceType: "Dropping",
        dateTime: "",
        pickupPoint: "",
        destination: "",
        numberOfPeople: 1,
        notes: "",
      });
      fetchBookings();
      setActiveTab("history");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put("/api/customers/profile", profile);
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const cancelBooking = (bookingId) => {
    setConfirmModal({
      isOpen: true,
      title: "Cancel Booking",
      message:
        "Are you sure you want to cancel this booking? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await axios.put(`/api/customers/bookings/${bookingId}/cancel`);
          toast.success("Booking cancelled successfully");
          fetchBookings();
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to cancel booking",
          );
        }
      },
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      "on-the-way": "bg-purple-100 text-purple-800",
      "picked-up": "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/images/logo.png"
                alt="ELOCAB"
                className="h-10 w-auto"
                onError={(e) => (e.target.style.display = "none")}
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">ELOCAB</h1>
                <p className="text-xs text-gray-500">Customer Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                  {(profile?.name || user?.phoneNumber || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  {profile?.name || user?.phoneNumber}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex space-x-1 py-2">
            {[
              {
                key: "book",
                label: "Book a Ride",
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                ),
              },
              {
                key: "history",
                label: "My Bookings",
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                ),
              },
              {
                key: "profile",
                label: "Profile",
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                ),
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Book a Ride Tab */}
        {activeTab === "book" && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-soft p-6 sm:p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Book Your Ride
                  </h2>
                  <p className="text-sm text-gray-500">
                    Fill in the details to request a ride
                  </p>
                </div>
              </div>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Service Type *
                  </label>
                  <select
                    value={bookingForm.serviceType}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        serviceType: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  >
                    <option value="Dropping">Dropping</option>
                    <option value="Hiring">Car Hiring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={bookingForm.dateTime}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        dateTime: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Pickup Point *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.pickupPoint}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        pickupPoint: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="e.g., KNUST Campus"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Destination *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.destination}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        destination: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="e.g., Adum"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Number of People *
                  </label>
                  <input
                    type="number"
                    value={bookingForm.numberOfPeople}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        numberOfPeople: parseInt(e.target.value),
                      })
                    }
                    className="input-field"
                    min="1"
                    max="50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, notes: e.target.value })
                    }
                    className="input-field"
                    rows="3"
                    placeholder="Any special requests or information..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Book Now"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Booking History Tab */}
        {activeTab === "history" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">My Bookings</h2>
                <p className="text-sm text-gray-500">
                  {bookings.length} booking{bookings.length !== 1 ? "s" : ""}{" "}
                  total
                </p>
              </div>
            </div>
            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-soft text-center py-16 border border-gray-100">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No bookings yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Your ride history will appear here
                </p>
                <button
                  onClick={() => setActiveTab("book")}
                  className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-light"
                >
                  Book Your First Ride
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Service Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Route
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Passengers
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Driver
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map((booking) => (
                        <tr
                          key={booking._id}
                          className="hover:bg-gray-50"
                          style={{ transition: "background 0.15s ease" }}
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}
                            >
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-800 font-medium">
                            {booking.serviceType}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {new Date(booking.dateTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="text-gray-800 font-medium">
                                {booking.pickupPoint}
                              </div>
                              <div className="text-gray-500 text-xs">
                                → {booking.destination}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {booking.numberOfPeople}
                          </td>
                          <td className="px-6 py-4">
                            {booking.driverId && booking.driverId.name ? (
                              <div className="text-sm">
                                <div className="font-semibold text-gray-800">
                                  {booking.driverId.name}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {booking.driverId.contactNumber}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                Awaiting assignment
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {(booking.status === "pending" ||
                              booking.status === "accepted") && (
                              <button
                                onClick={() => cancelBooking(booking._id)}
                                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(booking.dateTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <span className="text-gray-500 text-xs block">
                            Service
                          </span>
                          <span className="font-semibold text-gray-800">
                            {booking.serviceType}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <span className="text-gray-500 text-xs block">
                            Passengers
                          </span>
                          <span className="font-semibold text-gray-800">
                            {booking.numberOfPeople}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 bg-gray-50 rounded-xl p-3">
                        <span className="text-gray-500 text-xs block mb-1">
                          Route
                        </span>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-800">
                            {booking.pickupPoint}
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                          <span className="font-medium text-gray-800">
                            {booking.destination}
                          </span>
                        </div>
                      </div>
                      {booking.driverId && booking.driverId.name && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {booking.driverId.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-800">
                            {booking.driverId.name}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">
                            {booking.driverId.contactNumber}
                          </span>
                        </div>
                      )}
                      {(booking.status === "pending" ||
                        booking.status === "accepted") && (
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="mt-3 w-full py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-soft p-6 sm:p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    My Profile
                  </h2>
                  <p className="text-sm text-gray-500">
                    Update your personal information
                  </p>
                </div>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={profile?.name || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={user?.phoneNumber || profile?.phoneNumber || ""}
                    className="input-field bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Phone number is used for login and cannot be changed here
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </form>

              {/* Install App Button */}
              {isInstallable && !isInstalled && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={async () => {
                      const accepted = await promptInstall();
                      if (accepted)
                        toast.success("App installed successfully! 🎉");
                    }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all font-semibold shadow-lg"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Install ELOCAB App
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Add to home screen for quick access
                  </p>
                </div>
              )}
              {isInstalled && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-green-600 justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm font-medium">App installed</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Install Prompt */}
      <InstallPrompt
        show={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default CustomerDashboard;
