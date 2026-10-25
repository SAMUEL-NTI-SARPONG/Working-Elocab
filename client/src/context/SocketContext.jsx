import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
const SocketContext = createContext({ socket: null });
export const useSocket = () => useContext(SocketContext);
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    if (!user?.token) return;
    const connection = io(
      import.meta.env.VITE_API_URL || window.location.origin,
      {
        auth: { token: user.token },
        withCredentials: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 3000,
      },
    );
    const alert = (message) => {
      toast(message, { id: "ride-update" });
      if (
        document.hidden &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted" &&
        localStorage.getItem("elocab_desktop_alerts") === "true"
      ) {
        try {
          new Notification("ELOCAB journey update", {
            body: message,
            icon: "/images/icon-192.png",
            tag: "elocab-ride-update",
          });
        } catch {}
      }
    };
    connection.on("newBooking", () => {
      if (user.role === "admin")
        alert("A new ride request is ready for a driver.");
    });
    connection.on("newAssignment", () => {
      if (user.role === "driver")
        alert("A new journey has been assigned to you.");
    });
    connection.on("bookingAssigned", () => {
      if (user.role === "customer")
        alert("Your driver has been assigned. View My rides for details.");
    });
    connection.on("bookingCancelled", () =>
      alert("A journey has been cancelled. Your ride list is up to date."),
    );
    setSocket(connection);
    return () => {
      connection.close();
      setSocket(null);
    };
  }, [user?.token]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
