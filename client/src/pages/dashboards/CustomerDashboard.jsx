import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  useEffect(() => {
    fetchProfile();
    fetchBookings();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("/api/customers/profile");
      setProfile(data);
    } catch (error) {
      toast.error("Failed to fetch profile");
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/customers/bookings");
      setBookings(data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/5 scale-110 group-hover:scale-125 transition-all duration-300"></div>
                  <img
                    src="/images/logo.png"
                    alt="ELOCAB"
                    className="h-14 w-auto relative z-10 group-hover:scale-105 transition-all duration-500 drop-shadow-2xl"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-gray-900">
                    ELOCAB
                  </h1>
                  <p className="text-xs text-gray-500">Customer Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {profile?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
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
              onClick={() => setActiveTab("book")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "book"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Book a Ride
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "profile"
                  ? "border-primary text-primary"
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
        {/* Book a Ride Tab */}
        {activeTab === "book" && (
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <h2 className="text-2xl font-bold text-primary mb-6">
                Book Your Ride
              </h2>
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
          <div>
            <h2 className="text-2xl font-bold text-primary mb-6">
              My Bookings
            </h2>
            {bookings.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No bookings yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-primary to-primary-light text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Service Type
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Date & Time
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Route
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Passengers
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr
                          key={booking._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : booking.status === "accepted"
                                    ? "bg-blue-100 text-blue-800"
                                    : booking.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                              }`}
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
                          {booking.driverId && (
                            <td className="px-6 py-4">
                              {booking.driverId.name ? (
                                <div className="text-sm">
                                  <div className="font-semibold text-gray-800">
                                    {booking.driverId.name}
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    {booking.driverId.contactNumber}
                                  </div>
                                </div>
                              ) : null}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4 p-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "accepted"
                                ? "bg-blue-100 text-blue-800"
                                : booking.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(booking.dateTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Service:</span>
                          <span className="ml-2 font-semibold">
                            {booking.serviceType}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">From:</span>
                          <span className="ml-2">{booking.pickupPoint}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">To:</span>
                          <span className="ml-2">{booking.destination}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Passengers:</span>
                          <span className="ml-2">{booking.numberOfPeople}</span>
                        </div>
                        {booking.driver && (
                          <div>
                            <span className="text-gray-500">Driver:</span>
                            <span className="ml-2 font-semibold">
                              {booking.driver.name}
                            </span>
                          </div>
                        )}
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
              <h2 className="text-2xl font-bold text-primary mb-6">
                My Profile
              </h2>
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    className="input-field bg-gray-100"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profile?.phone || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="input-field"
                    placeholder="Your phone number"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
