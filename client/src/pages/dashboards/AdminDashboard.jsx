import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");

  useEffect(() => {
    fetchStats();
    fetchDrivers();
    fetchCustomers();
    fetchBookings();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("/api/admin/stats");
      setStats(data);
    } catch (error) {
      toast.error("Failed to fetch statistics");
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data } = await axios.get("/api/admin/drivers");
      setDrivers(data);
    } catch (error) {
      toast.error("Failed to fetch drivers");
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get("/api/admin/customers");
      setCustomers(data);
    } catch (error) {
      toast.error("Failed to fetch customers");
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/admin/bookings");
      setBookings(data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    }
  };

  const assignDriver = async () => {
    if (!selectedBooking || !selectedDriver) {
      toast.error("Please select both booking and driver");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/admin/bookings/assign", {
        bookingId: selectedBooking,
        driverId: selectedDriver,
      });
      toast.success("Driver assigned successfully!");
      setSelectedBooking(null);
      setSelectedDriver("");
      fetchBookings();
      fetchStats();
    } catch (error) {
      toast.error("Failed to assign driver");
    } finally {
      setLoading(false);
    }
  };

  const deleteDriver = async (driverId) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    try {
      await axios.delete(`/api/admin/drivers/${driverId}`);
      toast.success("Driver deleted successfully");
      fetchDrivers();
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete driver");
    }
  };

  const deleteCustomer = async (customerId) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      await axios.delete(`/api/admin/customers/${customerId}`);
      toast.success("Customer deleted successfully");
      fetchCustomers();
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete customer");
    }
  };

  const toggleDriverStatus = async (driverId) => {
    try {
      await axios.put(`/api/admin/drivers/${driverId}/toggle-status`);
      toast.success("Driver status updated");
      fetchDrivers();
    } catch (error) {
      toast.error("Failed to update driver status");
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

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const assignedBookings = bookings.filter((b) => b.status === "assigned");
  const activeBookings = bookings.filter(
    (b) => !["completed", "cancelled"].includes(b.status)
  );
  const completedBookings = bookings.filter((b) =>
    ["completed", "cancelled"].includes(b.status)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary shadow-lg">
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
                  <p className="text-xs text-gray-300">Admin Dashboard</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {["dashboard", "bookings", "drivers", "customers"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div>
            <h2 className="text-2xl font-bold text-primary mb-6">
              Dashboard Overview
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card bg-blue-50">
                <h3 className="text-gray-600 text-sm mb-2">Total Drivers</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.drivers.total}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Active: {stats.drivers.active}
                </p>
              </div>

              <div className="card bg-green-50">
                <h3 className="text-gray-600 text-sm mb-2">Total Customers</h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.customers.total}
                </p>
              </div>

              <div className="card bg-yellow-50">
                <h3 className="text-gray-600 text-sm mb-2">Pending Bookings</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.bookings.pending}
                </p>
              </div>

              <div className="card bg-purple-50">
                <h3 className="text-gray-600 text-sm mb-2">
                  Completed Bookings
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.bookings.completed}
                </p>
              </div>
            </div>

            {pendingBookings.length > 0 && (
              <div className="card bg-yellow-50 border-l-4 border-yellow-500">
                <h3 className="font-bold text-yellow-800 mb-2">
                  ⚠️ Pending Bookings Require Action
                </h3>
                <p className="text-yellow-700">
                  You have {pendingBookings.length} pending booking(s) that need
                  driver assignment.
                </p>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
                >
                  View Pending Bookings
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <h2 className="text-2xl font-bold text-primary mb-6">
              Booking Management
            </h2>

            {/* Pending Bookings */}
            {pendingBookings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-yellow-600 mb-4">
                  ⏳ Pending Assignments ({pendingBookings.length})
                </h3>
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="card border-l-4 border-yellow-500"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold">
                            {booking.serviceType}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.dateTime).toLocaleString()}
                          </p>
                          <div className="mt-2 grid md:grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm text-gray-500">Pickup</p>
                              <p className="font-semibold">
                                {booking.pickupPoint}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Destination</p>
                              <p className="font-semibold">
                                {booking.destination}
                              </p>
                            </div>
                          </div>
                          {booking.customerId && (
                            <div className="mt-2 text-sm">
                              <p>
                                <strong>Customer:</strong>{" "}
                                {booking.customerId.name} -{" "}
                                {booking.customerId.phoneNumber}
                              </p>
                              <p>
                                <strong>Passengers:</strong>{" "}
                                {booking.numberOfPeople}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-end gap-4 mt-4 border-t pt-4">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Assign Driver
                          </label>
                          <select
                            className="input-field"
                            value={
                              selectedBooking === booking._id
                                ? selectedDriver
                                : ""
                            }
                            onChange={(e) => {
                              setSelectedBooking(booking._id);
                              setSelectedDriver(e.target.value);
                            }}
                          >
                            <option value="">Select a driver...</option>
                            {drivers.map((driver) => (
                              <option key={driver._id} value={driver._id}>
                                {driver.name} - {driver.carType} ({driver.seats}{" "}
                                seats) {driver.isAvailable ? "✅" : "⚫"}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={assignDriver}
                          disabled={
                            selectedBooking !== booking._id ||
                            !selectedDriver ||
                            loading
                          }
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Bookings */}
            {assignedBookings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-600 mb-4">
                  🚗 Active Rides ({assignedBookings.length})
                </h3>
                <div className="space-y-4">
                  {assignedBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="card border-l-4 border-blue-500"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold">
                            {booking.serviceType}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.dateTime).toLocaleString()}
                          </p>
                          <div className="mt-2 grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Route</p>
                              <p className="font-semibold">
                                {booking.pickupPoint} → {booking.destination}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Driver</p>
                              <p className="font-semibold">
                                {booking.driverId?.name} -{" "}
                                {booking.driverId?.contactNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.replace("-", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Bookings */}
            {completedBookings.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-600 mb-4">
                  ✅ Completed Rides ({completedBookings.length})
                </h3>
                <div className="space-y-4">
                  {completedBookings.slice(0, 10).map((booking) => (
                    <div key={booking._id} className="card">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">
                            {booking.pickupPoint} → {booking.destination}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.dateTime).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === "drivers" && (
          <div>
            <h2 className="text-2xl font-bold text-primary mb-6">
              Driver Management
            </h2>

            {drivers.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No drivers registered yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-primary to-primary-light text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Vehicle</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {drivers.map((driver) => (
                        <tr key={driver._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-800">
                            {driver.name}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                driver.isAvailable
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {driver.isAvailable ? "Online" : "Offline"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {driver.email}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-800">{driver.carType}</div>
                              <div className="text-gray-500 text-xs">
                                {driver.carNumber} • {driver.seats} seats
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {driver.contactNumber}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {driver.baseLocation}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => deleteDriver(driver._id)}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all text-sm font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Cards */}
                <div className="lg:hidden space-y-4 p-4">
                  {drivers.map((driver) => (
                    <div key={driver._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-gray-800">{driver.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            driver.isAvailable
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {driver.isAvailable ? "Online" : "Offline"}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div><span className="text-gray-500">Email:</span> <span className="ml-2">{driver.email}</span></div>
                        <div><span className="text-gray-500">Vehicle:</span> <span className="ml-2">{driver.carType} ({driver.carNumber})</span></div>
                        <div><span className="text-gray-500">Seats:</span> <span className="ml-2">{driver.seats}</span></div>
                        <div><span className="text-gray-500">Contact:</span> <span className="ml-2">{driver.contactNumber}</span></div>
                        <div><span className="text-gray-500">Location:</span> <span className="ml-2">{driver.baseLocation}</span></div>
                      </div>
                      <button
                        onClick={() => deleteDriver(driver._id)}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
                      >
                        Delete Driver
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div>
            <h2 className="text-2xl font-bold text-primary mb-6">
              Customer Management
            </h2>

            {customers.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No customers registered yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-primary to-primary-light text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">City</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-800">
                            {customer.name || "No Name"}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {customer.email}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {customer.phoneNumber || "Not set"}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {customer.city || "Not set"}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => deleteCustomer(customer._id)}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all text-sm font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4 p-4">
                  {customers.map((customer) => (
                    <div key={customer._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <h3 className="font-bold text-gray-800 mb-3">
                        {customer.name || "No Name"}
                      </h3>
                      <div className="space-y-2 text-sm mb-4">
                        <div><span className="text-gray-500">Email:</span> <span className="ml-2">{customer.email}</span></div>
                        <div><span className="text-gray-500">Phone:</span> <span className="ml-2">{customer.phoneNumber || "Not set"}</span></div>
                        <div><span className="text-gray-500">City:</span> <span className="ml-2">{customer.city || "Not set"}</span></div>
                      </div>
                      <button
                        onClick={() => deleteCustomer(customer._id)}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
                      >
                        Delete Customer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
