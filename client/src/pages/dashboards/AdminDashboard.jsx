import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import ArchiveViewer from "../../components/ArchiveViewer";
import InstallPrompt from "../../components/InstallPrompt";
import ConfirmModal from "../../components/ConfirmModal";
import NotificationModal from "../../components/NotificationModal";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
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
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showCreateDriver, setShowCreateDriver] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    phoneNumber: "",
    password: "",
    name: "",
    city: "",
    digitalAddress: "",
  });
  const [newDriver, setNewDriver] = useState({
    phoneNumber: "",
    password: "",
    name: "",
    contactNumber: "",
    baseLocation: "",
    carType: "",
    carNumber: "",
    licenseNumber: "",
    seats: 4,
  });
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "danger",
    confirmText: "Confirm",
    requireType: null,
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
    fetchStats();
    fetchDrivers();
    fetchCustomers();
    fetchBookings();

    // Note: Do NOT auto-request notification permission on mount
    // Modern browsers block this — permission must be requested via user gesture (button click)
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
      if (
        bookings.length > 0 &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const pendingCount = bookings.filter(
          (b) => b.status === "pending",
        ).length;
        if (pendingCount > 0 && activeTab !== "bookings") {
          // Show notification if there are pending bookings and user is not on bookings tab
          try {
            new Notification("New Booking Alert", {
              body: `You have ${pendingCount} pending booking(s) awaiting assignment`,
              icon: "/images/logo.png",
              badge: "/images/logo.png",
            });
          } catch (e) {
            console.log("Notification failed:", e);
          }
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
      if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.message || "Failed to fetch statistics",
        );
      }
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data } = await axios.get("/api/admin/drivers");
      setDrivers(data);
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to fetch drivers");
      }
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get("/api/admin/customers");
      setCustomers(data);
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.message || "Failed to fetch customers",
        );
      }
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/admin/bookings");
      setBookings(data);
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.message || "Failed to fetch bookings",
        );
      }
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
      toast.error(error.response?.data?.message || "Failed to assign driver");
    } finally {
      setLoading(false);
    }
  };

  const deleteDriver = async (driverId) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Driver",
      message:
        "Are you sure you want to delete this driver? Their account and all associated data will be permanently removed.",
      variant: "danger",
      confirmText: "Delete Driver",
      requireType: null,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await axios.delete(`/api/admin/drivers/${driverId}`);
          toast.success("Driver deleted successfully");
          fetchDrivers();
          fetchStats();
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to delete driver",
          );
        }
      },
    });
  };

  const deleteCustomer = async (customerId) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Customer",
      message:
        "Are you sure you want to delete this customer? Their account and booking history will be permanently removed.",
      variant: "danger",
      confirmText: "Delete Customer",
      requireType: null,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await axios.delete(`/api/admin/customers/${customerId}`);
          toast.success("Customer deleted successfully");
          fetchCustomers();
          fetchStats();
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to delete customer",
          );
        }
      },
    });
  };

  const toggleDriverStatus = async (driverId) => {
    try {
      await axios.put(`/api/admin/drivers/${driverId}/toggle-status`);
      toast.success("Driver status updated");
      fetchDrivers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update driver status",
      );
    }
  };

  const clearCompletedBookings = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Clear Completed Bookings",
      message:
        "This will permanently delete all completed and cancelled bookings. This action cannot be undone.",
      variant: "warning",
      confirmText: "Clear Bookings",
      requireType: null,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoading(true);
        try {
          const { data } = await axios.delete(
            "/api/admin/bookings/clear-completed",
          );
          toast.success(data.message);
          fetchBookings();
          fetchStats();
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              "Failed to clear completed bookings",
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const clearAllBookings = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete ALL Bookings",
      message:
        "This will permanently delete ALL bookings including active ones. This is irreversible and cannot be undone.",
      variant: "danger",
      confirmText: "Delete Everything",
      requireType: "DELETE ALL",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoading(true);
        try {
          const { data } = await axios.delete("/api/admin/bookings/clear-all");
          toast.success(data.message);
          fetchBookings();
          fetchStats();
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to clear all bookings",
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      toast.success("Notifications are already enabled!");
      setNotificationPermission("granted");
      // Show a test notification
      try {
        new Notification("ELOCAB Admin", {
          body: "Notifications are working correctly",
          icon: "/images/logo.png",
        });
      } catch (e) {
        console.log("Test notification failed:", e);
      }
      return;
    }

    if (Notification.permission === "denied") {
      toast.error(
        "Notifications are blocked. Please enable them in your browser settings (click the lock icon in the address bar).",
        { duration: 6000 },
      );
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        toast.success("Notifications enabled successfully!");
        try {
          new Notification("ELOCAB Admin", {
            body: "You will now receive notifications for new bookings",
            icon: "/images/logo.png",
          });
        } catch (e) {
          console.log("Test notification failed:", e);
        }
      } else if (permission === "denied") {
        toast.error(
          "Notifications were denied. You can enable them later in browser settings.",
          { duration: 5000 },
        );
      } else {
        toast.error("Notification permission was dismissed. Try again.");
      }
    } catch (error) {
      console.error("Notification error:", error);
      toast.error("Failed to enable notifications. Try using Chrome or Edge.");
    }
  };

  const fetchArchiveStats = async () => {
    try {
      const { data } = await axios.get("/api/admin/archive/stats");
      setArchiveStats(data);
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.message || "Failed to fetch archive statistics",
        );
      }
    }
  };

  const resetStatistics = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset All Statistics",
      message:
        "This will reset ALL lifetime statistics to zero. This is irreversible and cannot be undone.",
      variant: "danger",
      confirmText: "Reset Statistics",
      requireType: "RESET",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoading(true);
        try {
          const { data } = await axios.post("/api/admin/stats/reset");
          toast.success(data.message);
          fetchStats();
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to reset statistics",
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const previewArchive = async () => {
    setArchiveLoading(true);
    try {
      const { data } = await axios.get("/api/admin/archive/preview");
      if (data.count === 0) {
        toast("No bookings available for archiving", { icon: "ℹ️" });
        return;
      }

      toast.success(
        `Found ${data.count} booking(s) older than 90 days ready for archiving. Cutoff: ${new Date(data.cutoffDate).toLocaleDateString()}`,
        { duration: 5000 },
      );
      console.log("Archivable bookings:", data.bookings);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to preview archive");
    } finally {
      setArchiveLoading(false);
    }
  };

  const executeArchive = async () => {
    if (!archiveStats || archiveStats.archivable === 0) {
      toast.error("No bookings available for archiving");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Archive & Download",
      message: `This will archive and delete ${archiveStats.archivable} booking(s) older than 90 days. The data will be downloaded as a JSON file before deletion.`,
      variant: "warning",
      confirmText: "Archive & Download",
      requireType: null,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setArchiveLoading(true);
        try {
          const { data } = await axios.post("/api/admin/archive/execute");

          // Create and download JSON file
          const blob = new Blob([JSON.stringify(data.data, null, 2)], {
            type: "application/json",
          });
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
          toast.error(
            error.response?.data?.message || "Failed to execute archive",
          );
        } finally {
          setArchiveLoading(false);
        }
      },
    });
  };

  const createCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/admin/customers", newCustomer);
      toast.success("Customer created successfully!");
      setShowCreateCustomer(false);
      setNewCustomer({
        phoneNumber: "",
        password: "",
        name: "",
        city: "",
        digitalAddress: "",
      });
      fetchCustomers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  const createDriver = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/admin/drivers", newDriver);
      toast.success("Driver created successfully!");
      setShowCreateDriver(false);
      setNewDriver({
        phoneNumber: "",
        password: "",
        name: "",
        contactNumber: "",
        baseLocation: "",
        carType: "",
        carNumber: "",
        licenseNumber: "",
        seats: 4,
      });
      fetchDrivers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create driver");
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

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const assignedBookings = bookings.filter(
    (b) => !["pending", "completed", "cancelled"].includes(b.status),
  );
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
                onError={(e) => (e.target.style.display = "none")}
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">ELOCAB</h1>
                <p className="text-xs text-gray-500">Admin Control Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationModal />
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                  A
                </div>
                <span className="text-sm text-gray-700 font-medium">Admin</span>
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
          <div className="flex gap-1 overflow-x-auto py-2 -mb-px scrollbar-hide">
            {[
              {
                key: "dashboard",
                label: "Dashboard",
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                ),
              },
              {
                key: "bookings",
                label: "Bookings",
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
                key: "drivers",
                label: "Drivers",
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
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                ),
              },
              {
                key: "customers",
                label: "Customers",
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"
                    />
                  </svg>
                ),
              },
              {
                key: "settings",
                label: "Settings",
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
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
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Dashboard Overview
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Real-time overview of your fleet operations
                </p>
              </div>
              <div className="text-xs text-gray-400 font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div
                className="stat-card border-blue-500 animate-fade-in-up"
                style={{ animationDelay: "0s" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    {stats.drivers.active} active
                  </span>
                </div>
                <p className="text-3xl font-black text-gray-800 stat-number">
                  {stats.drivers.total}
                </p>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Total Drivers
                </p>
              </div>

              <div
                className="stat-card border-emerald-500 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <svg
                      className="w-6 h-6 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-800 stat-number">
                  {stats.customers.total}
                </p>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Total Customers
                </p>
              </div>

              <div
                className="stat-card border-amber-500 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <svg
                      className="w-6 h-6 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  {stats.bookings.pending > 0 && (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full animate-pulse">
                      Needs action
                    </span>
                  )}
                </div>
                <p className="text-3xl font-black text-gray-800 stat-number">
                  {stats.bookings.pending}
                </p>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Pending Bookings
                </p>
              </div>

              <div
                className="stat-card border-violet-500 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-violet-100 rounded-xl">
                    <svg
                      className="w-6 h-6 text-violet-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-800 stat-number">
                  {stats.bookings.completed}
                </p>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Completed Bookings
                </p>
              </div>
            </div>

            {/* Lifetime Statistics */}
            {stats.lifetime && (
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Lifetime Statistics
                    </h3>
                    <p className="text-sm text-gray-500">
                      Persists after data cleanup
                    </p>
                  </div>
                  <button
                    onClick={resetStatistics}
                    className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-xl hover:bg-red-100 border border-red-200 font-semibold"
                    disabled={loading}
                  >
                    Reset Stats
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/20 rounded-lg">
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-blue-200">
                        All time
                      </span>
                    </div>
                    <p className="text-3xl font-black">
                      {stats.lifetime.totalBookings}
                    </p>
                    <p className="text-sm text-blue-200 mt-1">Total Bookings</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/20 rounded-lg">
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
                      </div>
                      <span className="text-xs font-medium text-emerald-200">
                        All time
                      </span>
                    </div>
                    <p className="text-3xl font-black">
                      {stats.lifetime.totalCompleted}
                    </p>
                    <p className="text-sm text-emerald-200 mt-1">Completed</p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/20 rounded-lg">
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-rose-200">
                        All time
                      </span>
                    </div>
                    <p className="text-3xl font-black">
                      {stats.lifetime.totalCancelled}
                    </p>
                    <p className="text-sm text-rose-200 mt-1">Cancelled</p>
                  </div>
                </div>
                {stats.lifetime.last7Days &&
                  stats.lifetime.last7Days.length > 0 && (
                    <div className="mt-4 bg-white rounded-2xl shadow-soft p-6">
                      <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Last 7 Days Activity
                      </h4>
                      <div className="space-y-3">
                        {stats.lifetime.last7Days.map((day, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-sm py-2 px-3 rounded-lg hover:bg-gray-50"
                          >
                            <span className="text-gray-600 font-medium">
                              {new Date(day.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <div className="flex gap-4">
                              <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md text-xs">
                                {day.bookingCount} bookings
                              </span>
                              <span className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-md text-xs">
                                {day.completedCount} done
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {pendingBookings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl shrink-0">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-800 text-lg">
                    {pendingBookings.length} Pending Booking
                    {pendingBookings.length > 1 ? "s" : ""} Require Action
                  </h3>
                  <p className="text-amber-700 text-sm mt-1">
                    Assign drivers to these bookings to keep your service
                    running smoothly.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-semibold text-sm shrink-0"
                >
                  View & Assign
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">
              Booking Management
            </h2>

            {/* Pending Bookings */}
            {pendingBookings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-yellow-600 mb-4">
                  ⏳ Pending Assignments ({pendingBookings.length})
                </h3>
                <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Route
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Passengers
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Assign Driver
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pendingBookings.map((booking) => (
                          <tr
                            key={booking._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
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
                                <div className="text-gray-500 text-xs">→</div>
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
                                  <div className="text-gray-600">
                                    {booking.customerId.phoneNumber}
                                  </div>
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
                                  <option value="">Select driver...</option>
                                  {drivers.map((driver) => (
                                    <option key={driver._id} value={driver._id}>
                                      {driver.name} - {driver.carType} (
                                      {driver.numberOfSeats} seats){" "}
                                      {driver.isAvailable ? "✅" : "⚫"}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={assignDriver}
                                  disabled={
                                    selectedBooking !== booking._id ||
                                    !selectedDriver ||
                                    loading
                                  }
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
                      <div
                        key={booking._id}
                        className="border border-yellow-200 rounded-lg p-4 shadow-sm bg-yellow-50"
                      >
                        <div className="mb-3">
                          <div className="font-bold text-gray-800 text-lg">
                            {booking.serviceType}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(booking.dateTime).toLocaleString()}
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div>
                            <div className="text-xs text-gray-500 font-semibold">
                              Route
                            </div>
                            <div className="font-semibold text-gray-800">
                              {booking.pickupPoint} → {booking.destination}
                            </div>
                          </div>

                          {booking.customerId && (
                            <div>
                              <div className="text-xs text-gray-500 font-semibold">
                                Customer
                              </div>
                              <div className="font-bold text-gray-800">
                                {booking.customerId.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {booking.customerId.phoneNumber}
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="text-xs text-gray-500 font-semibold">
                              Passengers
                            </div>
                            <div className="text-gray-800">
                              {booking.numberOfPeople}
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-3">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Assign Driver
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
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
                            <option value="">Select driver...</option>
                            {drivers.map((driver) => (
                              <option key={driver._id} value={driver._id}>
                                {driver.name} - {driver.carType} (
                                {driver.numberOfSeats} seats){" "}
                                {driver.isAvailable ? "✅" : "⚫"}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={assignDriver}
                            disabled={
                              selectedBooking !== booking._id ||
                              !selectedDriver ||
                              loading
                            }
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
                            Driver
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {assignedBookings.map((booking) => (
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
                                <div className="text-gray-500 text-xs">→</div>
                                <div className="font-semibold text-gray-800">
                                  {booking.destination}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {booking.driverId && (
                                <div className="text-sm">
                                  <div className="font-bold text-gray-800">
                                    {booking.driverId.name}
                                  </div>
                                  <div className="text-gray-600">
                                    {booking.driverId.contactNumber}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {booking.customerId && (
                                <div className="text-sm">
                                  <div className="font-bold text-gray-800">
                                    {booking.customerId.name}
                                  </div>
                                  <div className="text-gray-600">
                                    {booking.customerId.phoneNumber}
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    {booking.numberOfPeople} passengers
                                  </div>
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
                      <div
                        key={booking._id}
                        className="border border-blue-200 rounded-lg p-4 shadow-sm bg-blue-50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold text-gray-800 text-lg">
                              {booking.serviceType}
                            </div>
                            <div className="text-sm text-gray-600">
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

                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-gray-500 font-semibold">
                              Route
                            </div>
                            <div className="font-semibold text-gray-800">
                              {booking.pickupPoint} → {booking.destination}
                            </div>
                          </div>

                          {booking.driverId && (
                            <div>
                              <div className="text-xs text-gray-500 font-semibold">
                                Driver
                              </div>
                              <div className="font-bold text-gray-800">
                                {booking.driverId.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {booking.driverId.contactNumber}
                              </div>
                            </div>
                          )}

                          {booking.customerId && (
                            <div>
                              <div className="text-xs text-gray-500 font-semibold">
                                Customer
                              </div>
                              <div className="font-bold text-gray-800">
                                {booking.customerId.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {booking.customerId.phoneNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.numberOfPeople} passengers
                              </div>
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
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Completed Rides ({completedBookings.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedBookings.slice(0, 10).map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-white rounded-2xl shadow-soft p-5 flex items-center gap-4 border border-gray-100"
                    >
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${booking.status === "completed" ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {booking.status === "completed" ? (
                          <svg
                            className="w-5 h-5 text-green-600"
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
                        ) : (
                          <svg
                            className="w-5 h-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-sm truncate">
                          {booking.pickupPoint} → {booking.destination}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(booking.dateTime).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${getStatusColor(
                          booking.status,
                        )}`}
                      >
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === "drivers" && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Driver Management
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {drivers.length} driver{drivers.length !== 1 ? "s" : ""}{" "}
                  registered
                </p>
              </div>
              <button
                onClick={() => setShowCreateDriver(!showCreateDriver)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  showCreateDriver
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-primary text-white hover:bg-primary-light shadow-md hover:shadow-lg"
                }`}
              >
                {showCreateDriver ? (
                  <>
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>{" "}
                    Cancel
                  </>
                ) : (
                  <>
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
                    </svg>{" "}
                    Add Driver
                  </>
                )}
              </button>
            </div>

            {/* Create Driver Form*/}
            {showCreateDriver && (
              <div className="bg-white rounded-2xl shadow-soft mb-6 border border-gray-100 overflow-hidden animate-slide-up">
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
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
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Register New Driver
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Fields match the driver registration form
                  </p>
                </div>
                <form onSubmit={createDriver} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newDriver.phoneNumber}
                        onChange={(e) =>
                          setNewDriver({
                            ...newDriver,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={newDriver.password}
                        onChange={(e) =>
                          setNewDriver({
                            ...newDriver,
                            password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newDriver.name}
                        onChange={(e) =>
                          setNewDriver({ ...newDriver, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number{" "}
                        <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={newDriver.contactNumber}
                        onChange={(e) =>
                          setNewDriver({
                            ...newDriver,
                            contactNumber: e.target.value,
                          })
                        }
                        placeholder="Defaults to phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={newDriver.baseLocation}
                        onChange={(e) =>
                          setNewDriver({
                            ...newDriver,
                            baseLocation: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Car Type *
                      </label>
                      <select
                        required
                        value={newDriver.carType}
                        onChange={(e) =>
                          setNewDriver({
                            ...newDriver,
                            carType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select car type</option>
                        <option value="Toyota Vitz">Toyota Vitz</option>
                        <option value="Toyota Voxy">Toyota Voxy</option>
                        <option value="Toyota Hiace">Toyota Hiace</option>
                        <option value="Nissan Caravan">Nissan Caravan</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Car Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={newDriver.carNumber}
                        onChange={(e) =>
                          setNewDriver({
                            ...newDriver,
                            carNumber: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={newDriver.licenseNumber}
                        onChange={(e) =>
                          setNewDriver({
                            ...newDriver,
                            licenseNumber: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seats
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newDriver.seats}
                        onChange={(e) =>
                          setNewDriver({
                            ...newDriver,
                            seats: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary-light disabled:opacity-50 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    {loading ? "Creating..." : "Create Driver Account"}
                  </button>
                </form>
              </div>
            )}

            {drivers.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No drivers registered yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {drivers.map((driver) => (
                        <tr
                          key={driver._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
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
                            {driver.userId?.phoneNumber ||
                              driver.contactNumber ||
                              "Not set"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-800">
                                {driver.carType}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {driver.carNumber} • {driver.numberOfSeats}{" "}
                                seats
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
                    <div
                      key={driver._id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-soft"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {driver.name?.charAt(0) || "D"}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">
                              {driver.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {driver.userId?.phoneNumber ||
                                driver.contactNumber ||
                                ""}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            driver.isAvailable
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {driver.isAvailable ? "Online" : "Offline"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <span className="text-gray-500 text-xs block">
                            Vehicle
                          </span>
                          <span className="font-semibold text-gray-800">
                            {driver.carType}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <span className="text-gray-500 text-xs block">
                            Plate
                          </span>
                          <span className="font-semibold text-gray-800">
                            {driver.carNumber}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <span className="text-gray-500 text-xs block">
                            Seats
                          </span>
                          <span className="font-semibold text-gray-800">
                            {driver.numberOfSeats}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <span className="text-gray-500 text-xs block">
                            Location
                          </span>
                          <span className="font-semibold text-gray-800">
                            {driver.baseLocation}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-600 font-medium">
                          {driver.contactNumber}
                        </span>
                        <button
                          onClick={() => deleteDriver(driver._id)}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 text-sm font-semibold border border-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Customer Management
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {customers.length} customer{customers.length !== 1 ? "s" : ""}{" "}
                  registered
                </p>
              </div>
              <button
                onClick={() => setShowCreateCustomer(!showCreateCustomer)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  showCreateCustomer
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg"
                }`}
              >
                {showCreateCustomer ? (
                  <>
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>{" "}
                    Cancel
                  </>
                ) : (
                  <>
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
                    </svg>{" "}
                    Add Customer
                  </>
                )}
              </button>
            </div>

            {/* Create Customer Form */}
            {showCreateCustomer && (
              <div className="bg-white rounded-2xl shadow-soft mb-6 border border-gray-100 overflow-hidden animate-slide-up">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Register New Customer
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Fields match the customer signup form
                  </p>
                </div>
                <form onSubmit={createCustomer} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCustomer.name}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., John Mensah"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newCustomer.phoneNumber}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder="e.g., 0241234567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newCustomer.password}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            password: e.target.value,
                          })
                        }
                        placeholder="Minimum 6 characters"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCustomer.city}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            city: e.target.value,
                          })
                        }
                        placeholder="e.g., Kumasi"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Digital Address{" "}
                        <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={newCustomer.digitalAddress}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            digitalAddress: e.target.value,
                          })
                        }
                        placeholder="e.g., AK-039-5028"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    {loading ? "Creating..." : "Create Customer Account"}
                  </button>
                </form>
              </div>
            )}

            {customers.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No customers registered yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          City
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr
                          key={customer._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-semibold text-gray-800">
                            {customer.name || "No Name"}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {customer.phoneNumber ||
                              customer.userId?.phoneNumber ||
                              "Not set"}
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
                    <div
                      key={customer._id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-soft"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {(customer.name || "C").charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {customer.name || "No Name"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {customer.phoneNumber ||
                              customer.userId?.phoneNumber ||
                              ""}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <span className="text-gray-500 text-xs block">
                            Phone
                          </span>
                          <span className="font-semibold text-gray-800">
                            {customer.phoneNumber || "Not set"}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <span className="text-gray-500 text-xs block">
                            City
                          </span>
                          <span className="font-semibold text-gray-800">
                            {customer.city || "Not set"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCustomer(customer._id)}
                        className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 text-sm font-semibold border border-red-200"
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
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
              System Settings
            </h2>
            <p className="text-gray-500 mb-8">
              Manage notifications, data, and application settings
            </p>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-6 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    Push Notifications
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 mb-4">
                    Get real-time alerts when new bookings are created so you
                    can respond quickly.
                  </p>
                  <button
                    onClick={requestNotificationPermission}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm ${
                      notificationPermission === "granted"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {notificationPermission === "granted"
                      ? "Notifications Enabled"
                      : "Enable Notifications"}
                  </button>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Data Management
                  </h3>
                  <p className="text-sm text-gray-500">
                    Clean up booking data to maintain performance
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Clear Completed Bookings */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">
                        Clear Completed Bookings
                      </h4>
                      <p className="text-sm text-gray-600">
                        Remove <strong>{completedBookings.length}</strong>{" "}
                        completed/cancelled bookings to reduce database size.
                      </p>
                    </div>
                    <button
                      onClick={clearCompletedBookings}
                      disabled={loading || completedBookings.length === 0}
                      className="px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shrink-0"
                    >
                      {loading
                        ? "Clearing..."
                        : `Clear ${completedBookings.length}`}
                    </button>
                  </div>
                </div>

                {/* Clear All Bookings - Danger Zone */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-red-800 mb-1 flex items-center gap-2">
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
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        Danger Zone: Clear All Bookings
                      </h4>
                      <p className="text-sm text-red-700">
                        Permanently delete ALL bookings including active ones.
                        This cannot be undone.
                      </p>
                    </div>
                    <button
                      onClick={clearAllBookings}
                      disabled={loading || bookings.length === 0}
                      className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shrink-0"
                    >
                      {loading
                        ? "Clearing..."
                        : `Delete All ${bookings.length}`}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Archive & Download */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Archive & Download
                  </h3>
                  <p className="text-sm text-gray-500">
                    Archive bookings older than 90 days as JSON downloads
                  </p>
                </div>
              </div>

              {archiveStats && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-indigo-600">
                        {archiveStats.archivable}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Archivable (90+ days)
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-emerald-600">
                        {archiveStats.recentCompleted}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Recent Completed
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-amber-600">
                        {archiveStats.active}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Active (will keep)
                      </p>
                    </div>
                  </div>

                  {archiveStats.cutoffDate && (
                    <p className="text-sm text-gray-600 mb-4">
                      Cutoff:{" "}
                      <strong>
                        {new Date(archiveStats.cutoffDate).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" },
                        )}
                      </strong>
                      <span className="text-gray-500">
                        {" "}
                        — bookings before this date will be archived
                      </span>
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={previewArchive}
                      disabled={archiveLoading || archiveStats.archivable === 0}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
                    >
                      {archiveLoading ? "Loading..." : "Preview"}
                    </button>
                    <button
                      onClick={executeArchive}
                      disabled={archiveLoading || archiveStats.archivable === 0}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm flex items-center gap-2"
                    >
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      {archiveLoading
                        ? "Archiving..."
                        : `Download & Archive ${archiveStats.archivable}`}
                    </button>
                  </div>
                </div>
              )}

              {!archiveStats && (
                <div className="text-center py-6">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mb-2"></div>
                    <p className="text-gray-400 text-sm">
                      Loading archive data...
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Archive downloads a JSON file of completed/cancelled bookings
                  older than 90 days, then deletes them from the database.
                  Active bookings are never archived.
                </p>
              </div>
            </div>

            {/* PWA Status */}
            <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Progressive Web App</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <svg
                    className="w-5 h-5 mx-auto mb-1 text-green-300"
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
                  <p className="text-sm font-medium text-white/90">
                    Offline Support
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <svg
                    className="w-5 h-5 mx-auto mb-1 text-green-300"
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
                  <p className="text-sm font-medium text-white/90">
                    Push Notifications
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <svg
                    className="w-5 h-5 mx-auto mb-1 text-green-300"
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
                  <p className="text-sm font-medium text-white/90">
                    Installable
                  </p>
                </div>
              </div>
              {/* Install App Button */}
              {isInstallable && !isInstalled && (
                <button
                  onClick={async () => {
                    const accepted = await promptInstall();
                    if (accepted)
                      toast.success("App installed successfully! 🎉");
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all font-bold shadow-lg"
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
              )}
              {isInstalled && (
                <div className="flex items-center gap-2 justify-center bg-white/10 rounded-xl p-3">
                  <svg
                    className="w-5 h-5 text-green-300"
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
                  <span className="text-sm font-medium text-white/90">
                    App installed on this device
                  </span>
                </div>
              )}
            </div>

            {/* Archive Viewer */}
            <ArchiveViewer />
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
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        requireType={confirmModal.requireType}
        loading={loading}
      />
    </div>
  );
};

export default AdminDashboard;
