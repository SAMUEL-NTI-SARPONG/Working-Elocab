import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import InstallPrompt from "../../components/InstallPrompt";
import NotificationBell from "../../components/NotificationBell";

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
    numberOfSeats: "",
    contactNumber: "",
  });
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Only show install prompt once per session
    const hasSeenThisSession = sessionStorage.getItem("elocab_install_shown_this_session");
    const hasDismissedForever = localStorage.getItem("elocab_install_prompt_seen");
    
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
      const { data } = await axios.get("/api/drivers/profile");
      setProfile(data);
      setProfileForm({
        name: data.name || "",
        baseLocation: data.baseLocation || "",
        carType: data.carType || "",
        carNumber: data.carNumber || "",
        licenseNumber: data.licenseNumber || "",
        numberOfSeats: data.numberOfSeats || "",
        contactNumber: data.contactNumber || "",
      });
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      }
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/drivers/bookings");
      setBookings(data);
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to fetch bookings");
      }
    }
  };

  const toggleAvailability = async () => {
    try {
      const { data } = await axios.post("/api/drivers/toggle-availability");
      toast.success(data.message);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle availability");
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`/api/drivers/bookings/${bookingId}/status`, { status });
      toast.success("Booking status updated successfully!");
      fetchBookings();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update status";
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
    (b) => !["completed", "cancelled"].includes(b.status),
  );
  const completedBookings = bookings.filter((b) =>
    ["completed", "cancelled"].includes(b.status),
  );

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
                onError={(e) => (e.target.style.display = 'none')}
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">ELOCAB</h1>
                <p className="text-xs text-gray-500">Driver Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleAvailability}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  profile?.isAvailable
                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  profile?.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="hidden sm:inline">{profile?.isAvailable ? 'Online' : 'Offline'}</span>
              </button>
              <NotificationBell />
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                  {(profile?.name || user?.phoneNumber || 'D').charAt(0).toUpperCase()}
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex gap-1 py-2">
            {[
              { key: "bookings", label: "My Rides", icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )},
              { key: "history", label: "History", icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
              { key: "profile", label: "Profile", icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )},
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
        {/* Active Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Assigned Rides</h2>
                <p className="text-sm text-gray-500">{activeBookings.length} active ride{activeBookings.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {activeBookings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-soft text-center py-16 border border-gray-100">
                <div className={`p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${profile?.isAvailable ? "bg-green-100" : "bg-gray-100"}`}>
                  {profile?.isAvailable ? (
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-700 font-medium text-lg mb-1">
                  {profile?.isAvailable
                    ? "You're online and ready!"
                    : "You're currently offline"}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  {profile?.isAvailable
                    ? "We'll notify you when a ride is assigned."
                    : "Go online to start receiving ride assignments."}
                </p>
                {!profile?.isAvailable && (
                  <button
                    onClick={toggleAvailability}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-sm"
                  >
                    Go Online Now
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Route
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activeBookings.map((booking) => (
                        <tr
                          key={booking._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                booking.status,
                              )}`}
                            >
                              {booking.status.replace("-", " ").toUpperCase()}
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
                              <div className="font-semibold text-gray-800">
                                {booking.pickupPoint}
                              </div>
                              <div className="text-gray-500 text-xs">↓</div>
                              <div className="font-semibold text-gray-800">
                                {booking.destination}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {booking.customerId && (
                              <div className="text-sm">
                                <div className="font-bold text-gray-800">
                                  {booking.customerId.name}
                                </div>
                                <div className="text-primary font-semibold">
                                  {booking.customerId.phoneNumber}
                                </div>
                                <div className="text-gray-600">
                                  {booking.numberOfPeople}{" "}
                                  {booking.numberOfPeople > 1
                                    ? "people"
                                    : "person"}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              {booking.status === "accepted" && (
                                <button
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking._id,
                                      "on-the-way",
                                    )
                                  }
                                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-all text-sm whitespace-nowrap"
                                >
                                  On The Way
                                </button>
                              )}
                              {booking.status === "on-the-way" && (
                                <button
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking._id,
                                      "picked-up",
                                    )
                                  }
                                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-all text-sm whitespace-nowrap"
                                >
                                  Picked Up
                                </button>
                              )}
                              {booking.status === "picked-up" && (
                                <button
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking._id,
                                      "completed",
                                    )
                                  }
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all text-sm whitespace-nowrap"
                                >
                                  Complete Ride
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {activeBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-gray-800">
                            {booking.serviceType}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {new Date(booking.dateTime).toLocaleString()}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            booking.status,
                          )}`}
                        >
                          {booking.status.replace("-", " ").toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 mb-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 font-medium mb-1">Route</div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-800">{booking.pickupPoint}</span>
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span className="font-semibold text-gray-800">{booking.destination}</span>
                          </div>
                        </div>

                        {booking.customerId && (
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="text-xs text-gray-500 font-medium mb-1">Customer</div>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {(booking.customerId.name || "C").charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-gray-800 text-sm">{booking.customerId.name}</div>
                                <div className="text-secondary font-semibold text-xs">{booking.customerId.phoneNumber}</div>
                              </div>
                              <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-0.5 rounded-md">
                                {booking.numberOfPeople} {booking.numberOfPeople > 1 ? "people" : "person"}
                              </span>
                            </div>
                          </div>
                        )}

                        {booking.notes && (
                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                            <div className="text-xs font-semibold text-amber-700 mb-0.5">Note</div>
                            <div className="text-sm text-gray-700">{booking.notes}</div>
                          </div>
                        )}
                      </div>

                      {booking.status === "accepted" && (
                        <button
                          onClick={() => updateBookingStatus(booking._id, "on-the-way")}
                          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm"
                        >
                          On The Way
                        </button>
                      )}
                      {booking.status === "on-the-way" && (
                        <button
                          onClick={() => updateBookingStatus(booking._id, "picked-up")}
                          className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold text-sm"
                        >
                          Picked Up
                        </button>
                      )}
                      {booking.status === "picked-up" && (
                        <button
                          onClick={() => updateBookingStatus(booking._id, "completed")}
                          className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-sm"
                        >
                          Complete Ride
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Ride History</h2>
                <p className="text-sm text-gray-500">{completedBookings.length} completed ride{completedBookings.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {completedBookings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-soft text-center py-16 border border-gray-100">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No completed rides yet</p>
                <p className="text-gray-400 text-sm mt-1">Your ride history will appear here</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Service Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Route
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Passengers
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {completedBookings.map((booking) => (
                        <tr
                          key={booking._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
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
                              <div className="text-gray-800">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {completedBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="p-4"
                    >
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
                        <span className="text-gray-400 text-xs">
                          {new Date(booking.dateTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <span className="text-gray-500 text-xs block">Service</span>
                          <span className="font-semibold text-gray-800">{booking.serviceType}</span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <span className="text-gray-500 text-xs block">Passengers</span>
                          <span className="font-semibold text-gray-800">{booking.numberOfPeople}</span>
                        </div>
                      </div>
                      <div className="mt-3 bg-gray-50 rounded-xl p-3">
                        <span className="text-gray-500 text-xs block mb-1">Route</span>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-800">{booking.pickupPoint}</span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span className="font-medium text-gray-800">{booking.destination}</span>
                        </div>
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
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-soft p-6 sm:p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Driver Profile</h2>
                  <p className="text-sm text-gray-500">Manage your profile and vehicle info</p>
                </div>
              </div>

              {!editMode ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500 text-xs font-medium mb-1">Name</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.name || "Not set"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500 text-xs font-medium mb-1">Phone</p>
                      <p className="text-gray-800 font-semibold">
                        {user?.phoneNumber}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500 text-xs font-medium mb-1">Base Location</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.baseLocation || "Not set"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500 text-xs font-medium mb-1">Car Type</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.carType || "Not set"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500 text-xs font-medium mb-1">Car Number</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.carNumber || "Not set"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500 text-xs font-medium mb-1">License Number</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.licenseNumber || "Not set"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500 text-xs font-medium mb-1">Seats</p>
                      <p className="text-gray-800 font-semibold">
                        {profile?.numberOfSeats || "Not set"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500 text-xs font-medium mb-1">Contact Number</p>
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
                      value={profileForm.numberOfSeats}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          numberOfSeats: e.target.value,
                        })
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
                          numberOfSeats: profile?.numberOfSeats || "",
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

      {/* Install Prompt */}
      <InstallPrompt
        show={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
      />
    </div>
  );
};

export default DriverDashboard;
