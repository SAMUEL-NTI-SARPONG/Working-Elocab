import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket server
      const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        // Join with user ID
        newSocket.emit("join", user._id);
      });

      // Listen for new bookings (admin)
      newSocket.on("newBooking", (booking) => {
        if (user.role === "admin") {
          toast.success("New booking received!", {
            duration: 5000,
            icon: "🚗",
          });
          // Play notification sound
          playNotificationSound();
        }
      });

      // Listen for booking assignments (driver)
      newSocket.on("newAssignment", (booking) => {
        if (user.role === "driver") {
          toast.success(`New ride assigned! Pickup: ${booking.pickupPoint}`, {
            duration: 6000,
            icon: "🚗",
          });
          playNotificationSound();
        }
      });

      // Listen for booking updates (all)
      newSocket.on("bookingUpdated", (booking) => {
        toast.success("Booking status updated", {
          icon: "📋",
        });
      });

      // Listen for driver availability changes (admin)
      newSocket.on("driverAvailabilityChanged", (data) => {
        if (user.role === "admin") {
          toast(
            `${data.driverName} is now ${data.isAvailable ? "available" : "unavailable"}`,
            {
              icon: data.isAvailable ? "✅" : "❌",
            },
          );
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const value = {
    socket,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
