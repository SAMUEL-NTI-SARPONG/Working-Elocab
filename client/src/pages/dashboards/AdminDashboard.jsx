import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import ArchiveViewer from "../../components/ArchiveViewer";

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
  const [archiveStats, setArchiveStats] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchDrivers();
    fetchCustomers();
    fetchBookings();
    
    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch archive stats when settings tab is opened
  useEffect(() => {
    if (activeTab === "settings") {
      fetchArchiveStats();
    }
  }, [activeTab]);

  // Listen for new bookings for notifications
  useEffect(() => {
    const checkForNewBookings = () => {
      // This will trigger when bookings change
      if (bookings.length > 0 && Notification.permission === "granted") {
        const pendingCount = bookings.filter(b => b.status === "pending").length;
        if (pendingCount > 0 && activeTab !== "bookings") {
          // Show notification if there are pending bookings and user is not on bookings tab
          new Notification("New Booking Alert", {
            body: `You have ${pendingCount} pending booking(s) awaiting assignment`,
            icon: "/logo.png",
            badge: "/logo.png"
          });
        }
      }
    };

    const interval = setInterval(() => {
      fetchBookings();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [bookings, activeTab]);

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

  const clearCompletedBookings = async () => {
    if (!confirm("Are you sure you want to delete all completed and cancelled bookings? This cannot be undone!")) return;

    setLoading(true);
    try {
      const { data } = await axios.delete("/api/admin/bookings/clear-completed");
      toast.success(data.message);
      fetchBookings();
      fetchStats();
    } catch (error) {
      toast.error("Failed to clear completed bookings");
    } finally {
      setLoading(false);
    }
  };

  const clearAllBookings = async () => {
    if (!confirm("⚠️ WARNING: This will delete ALL bookings including active ones! Are you absolutely sure?")) return;
    if (!confirm("This is your final warning. All booking data will be permanently deleted. Continue?")) return;

    setLoading(true);
    try {
      const { data } = await axios.delete("/api/admin/bookings/clear-all");
      toast.success(data.message);
      fetchBookings();
      fetchStats();
    } catch (error) {
      toast.error("Failed to clear all bookings");
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      toast.success("Notifications are already enabled");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("Notifications enabled successfully!");
        // Test notification
        new Notification("ELOCAB Admin", {
          body: "You will now receive notifications for new bookings",
          icon: "/logo.png"
        });
      } else {
        toast.error("Notification permission denied");
      }
    } catch (error) {
      toast.error("Failed to enable notifications");
    }
  };

  const fetchArchiveStats = async () => {
    try {
      const { data } = await axios.get("/api/admin/archive/stats");
      setArchiveStats(data);
    } catch (error) {
      toast.error("Failed to fetch archive statistics");
    }
  };

  const previewArchive = async () => {
    setArchiveLoading(true);
    try {
      const { data } = await axios.get("/api/admin/archive/preview");
      if (data.count === 0) {
        toast("No bookings available for archiving", { icon: "ℹ️" });
        return;
      }
      
      const message = `Found ${data.count} booking(s) older than 90 days that will be archived.\n\nCutoff date: ${new Date(data.cutoffDate).toLocaleDateString()}`;
      if (confirm(message + "\n\nClick OK to preview the bookings or Cancel to go back.")) {
        console.log("Archivable bookings:", data.bookings);
        toast.success(`${data.count} bookings ready for archiving. Check console for details.`);
      }
    } catch (error) {
      toast.error("Failed to preview archive");
    } finally {
      setArchiveLoading(false);
    }
  };

  const executeArchive = async () => {
    if (!archiveStats || archiveStats.archivable === 0) {
      toast.error("No bookings available for archiving");
      return;
    }

    const message = `This will archive and delete ${archiveStats.archivable} booking(s) older than 90 days.\n\nThe data will be downloaded as a JSON file before deletion.\n\nContinue?`;
    if (!confirm(message)) return;

    setArchiveLoading(true);
    try {
      const { data } = await axios.post("/api/admin/archive/execute");
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(data.message);
      
      // Refresh data
      fetchBookings();
      fetchStats();
      fetchArchiveStats();
    } catch (error) {
      toast.error("Failed to execute archive");
    } finally {
      setArchiveLoading(false);
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
            {["dashboard", "bookings", "drivers", "customers", "settings"].map((tab) => (
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
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Service</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Date & Time</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Route</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Passengers</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Assign Driver</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pendingBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-800">
                              {booking.serviceType}
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-sm">
                              {new Date(booking.dateTime).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="font-semibold text-gray-800">{booking.pickupPoint}</div>
                                <div className="text-gray-500 text-xs">→</div>
                                <div className="font-semibold text-gray-800">{booking.destination}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {booking.customerId && (
                                <div className="text-sm">
                                  <div className="font-bold text-gray-800">{booking.customerId.name}</div>
                                  <div className="text-gray-600">{booking.customerId.phoneNumber}</div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {booking.numberOfPeople}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <select
                                  className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                  value={selectedBooking === booking._id ? selectedDriver : ""}
                                  onChange={(e) => {
                                    setSelectedBooking(booking._id);
                                    setSelectedDriver(e.target.value);
                                  }}
                                >
                                  <option value="">Select driver...</option>
                                  {drivers.map((driver) => (
                                    <option key={driver._id} value={driver._id}>
                                      {driver.name} - {driver.carType} ({driver.numberOfSeats} seats) {driver.isAvailable ? "✅" : "⚫"}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={assignDriver}
                                  disabled={selectedBooking !== booking._id || !selectedDriver || loading}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm whitespace-nowrap"
                                >
                                  Assign
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4 p-4">
                    {pendingBookings.map((booking) => (
                      <div key={booking._id} className="border border-yellow-200 rounded-lg p-4 shadow-sm bg-yellow-50">
                        <div className="mb-3">
                          <div className="font-bold text-gray-800 text-lg">{booking.serviceType}</div>
                          <div className="text-sm text-gray-600">{new Date(booking.dateTime).toLocaleString()}</div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div>
                            <div className="text-xs text-gray-500 font-semibold">Route</div>
                            <div className="font-semibold text-gray-800">{booking.pickupPoint} → {booking.destination}</div>
                          </div>
                          
                          {booking.customerId && (
                            <div>
                              <div className="text-xs text-gray-500 font-semibold">Customer</div>
                              <div className="font-bold text-gray-800">{booking.customerId.name}</div>
                              <div className="text-sm text-gray-600">{booking.customerId.phoneNumber}</div>
                            </div>
                          )}
                          
                          <div>
                            <div className="text-xs text-gray-500 font-semibold">Passengers</div>
                            <div className="text-gray-800">{booking.numberOfPeople}</div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-3">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Driver</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                            value={selectedBooking === booking._id ? selectedDriver : ""}
                            onChange={(e) => {
                              setSelectedBooking(booking._id);
                              setSelectedDriver(e.target.value);
                            }}
                          >
                            <option value="">Select driver...</option>
                            {drivers.map((driver) => (
                              <option key={driver._id} value={driver._id}>
                                {driver.name} - {driver.carType} ({driver.numberOfSeats} seats) {driver.isAvailable ? "✅" : "⚫"}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={assignDriver}
                            disabled={selectedBooking !== booking._id || !selectedDriver || loading}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Active Bookings */}
            {assignedBookings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-600 mb-4">
                  🚗 Active Rides ({assignedBookings.length})
                </h3>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-primary to-primary-light text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Service</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Date & Time</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Route</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Driver</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {assignedBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  booking.status
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
                                <div className="font-semibold text-gray-800">{booking.pickupPoint}</div>
                                <div className="text-gray-500 text-xs">→</div>
                                <div className="font-semibold text-gray-800">{booking.destination}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {booking.driverId && (
                                <div className="text-sm">
                                  <div className="font-bold text-gray-800">{booking.driverId.name}</div>
                                  <div className="text-gray-600">{booking.driverId.contactNumber}</div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {booking.customerId && (
                                <div className="text-sm">
                                  <div className="font-bold text-gray-800">{booking.customerId.name}</div>
                                  <div className="text-gray-600">{booking.customerId.phoneNumber}</div>
                                  <div className="text-gray-500 text-xs">{booking.numberOfPeople} passengers</div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4 p-4">
                    {assignedBookings.map((booking) => (
                      <div key={booking._id} className="border border-blue-200 rounded-lg p-4 shadow-sm bg-blue-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold text-gray-800 text-lg">{booking.serviceType}</div>
                            <div className="text-sm text-gray-600">{new Date(booking.dateTime).toLocaleString()}</div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.replace("-", " ").toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-gray-500 font-semibold">Route</div>
                            <div className="font-semibold text-gray-800">{booking.pickupPoint} → {booking.destination}</div>
                          </div>
                          
                          {booking.driverId && (
                            <div>
                              <div className="text-xs text-gray-500 font-semibold">Driver</div>
                              <div className="font-bold text-gray-800">{booking.driverId.name}</div>
                              <div className="text-sm text-gray-600">{booking.driverId.contactNumber}</div>
                            </div>
                          )}
                          
                          {booking.customerId && (
                            <div>
                              <div className="text-xs text-gray-500 font-semibold">Customer</div>
                              <div className="font-bold text-gray-800">{booking.customerId.name}</div>
                              <div className="text-sm text-gray-600">{booking.customerId.phoneNumber}</div>
                              <div className="text-xs text-gray-500">{booking.numberOfPeople} passengers</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                            {driver.userId?.email || "Not set"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-800">{driver.carType}</div>
                              <div className="text-gray-500 text-xs">
                                {driver.carNumber} • {driver.numberOfSeats} seats
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
                        <div><span className="text-gray-500">Email:</span> <span className="ml-2">{driver.userId?.email || "Not set"}</span></div>
                        <div><span className="text-gray-500">Vehicle:</span> <span className="ml-2">{driver.carType} ({driver.carNumber})</span></div>
                        <div><span className="text-gray-500">Seats:</span> <span className="ml-2">{driver.numberOfSeats}</span></div>
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
                            {customer.userId?.email || "Not set"}
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
                        <div><span className="text-gray-500">Email:</span> <span className="ml-2">{customer.userId?.email || "Not set"}</span></div>
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

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div>
            <h2 className="text-2xl font-bold text-primary mb-6">
              System Settings
            </h2>

            {/* Notification Settings */}
            <div className="card mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🔔</span>
                Push Notifications
              </h3>
              <p className="text-gray-600 mb-4">
                Enable push notifications to receive alerts when new bookings are created.
              </p>
              <button
                onClick={requestNotificationPermission}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
              >
                {Notification?.permission === "granted" 
                  ? "✅ Notifications Enabled" 
                  : "Enable Notifications"}
              </button>
            </div>

            {/* Data Management */}
            <div className="card mb-6 border-l-4 border-yellow-500">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🗄️</span>
                Data Management
              </h3>
              <p className="text-gray-600 mb-4">
                Manage your booking data to free up space and maintain optimal performance.
              </p>
              
              <div className="space-y-4">
                {/* Clear Completed Bookings */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">Clear Completed Bookings</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Remove all completed and cancelled bookings. This will help reduce database size.
                        Currently: <strong>{completedBookings.length}</strong> completed/cancelled bookings
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearCompletedBookings}
                    disabled={loading || completedBookings.length === 0}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                  >
                    {loading ? "Clearing..." : `Clear ${completedBookings.length} Bookings`}
                  </button>
                </div>

                {/* Clear All Bookings - Danger Zone */}
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-red-800 mb-1 flex items-center">
                        <span className="mr-2">⚠️</span>
                        Danger Zone: Clear All Bookings
                      </h4>
                      <p className="text-sm text-red-700 mb-3">
                        <strong>WARNING:</strong> This will permanently delete ALL bookings including active ones. 
                        This action cannot be undone! Use only when absolutely necessary.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearAllBookings}
                    disabled={loading || bookings.length === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                  >
                    {loading ? "Clearing..." : `Delete All ${bookings.length} Bookings`}
                  </button>
                </div>
              </div>
            </div>

            {/* Archive & Download */}
            <div className="card mb-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">📦</span>
                Archive & Download Bookings
              </h3>
              <p className="text-gray-600 mb-4">
                Archive old bookings (older than 90 days) to save storage space. Data is downloaded as JSON before deletion.
              </p>

              {archiveStats && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Archivable Bookings</p>
                      <p className="text-2xl font-bold text-blue-600">{archiveStats.archivable}</p>
                      <p className="text-xs text-gray-500">Older than 90 days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Recent Completed</p>
                      <p className="text-2xl font-bold text-green-600">{archiveStats.recentCompleted}</p>
                      <p className="text-xs text-gray-500">Last 90 days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Bookings</p>
                      <p className="text-2xl font-bold text-orange-600">{archiveStats.active}</p>
                      <p className="text-xs text-gray-500">Will be kept</p>
                    </div>
                  </div>

                  {archiveStats.cutoffDate && (
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Cutoff Date:</strong> {new Date(archiveStats.cutoffDate).toLocaleDateString()} 
                      <span className="text-gray-500"> (bookings before this date will be archived)</span>
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={previewArchive}
                      disabled={archiveLoading || archiveStats.archivable === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                    >
                      {archiveLoading ? "Loading..." : "Preview Archive"}
                    </button>
                    <button
                      onClick={executeArchive}
                      disabled={archiveLoading || archiveStats.archivable === 0}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2"
                    >
                      <span>📥</span>
                      {archiveLoading ? "Archiving..." : `Download & Archive ${archiveStats.archivable} Bookings`}
                    </button>
                  </div>
                </div>
              )}

              {!archiveStats && (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading archive statistics...</p>
                </div>
              )}

              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <strong>ℹ️ How it works:</strong> Archive downloads a JSON file containing all bookings older than 90 days (completed or cancelled), 
                  then safely deletes them from the database to free up space. Active bookings are never archived.
                </p>
              </div>
            </div>

            {/* PWA Status */}
            <div className="card mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">📱</span>
                Progressive Web App (PWA)
              </h3>
              <p className="text-gray-600 mb-2">
                This application is PWA-enabled. You can install it on your device for a better experience.
              </p>
              <p className="text-sm text-gray-500">
                ✅ Offline support enabled<br />
                ✅ Push notifications available<br />
                ✅ Can be installed on mobile and desktop
              </p>
            </div>

            {/* Archive Viewer */}
            <ArchiveViewer />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
