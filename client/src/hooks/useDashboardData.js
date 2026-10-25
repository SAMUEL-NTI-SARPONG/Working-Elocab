import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import { errorMessage } from "../context/AuthContext";
export default function useDashboardData(endpoints) {
  const key = JSON.stringify(endpoints);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const active = useRef(true);
  const pending = useRef(null);
  const queued = useRef(false);
  const { socket } = useSocket();
  const refresh = useCallback(() => {
    if (pending.current) {
      queued.current = true;
      return pending.current;
    }
    if (!active.current) return Promise.resolve();
    const execute = async () => {
      do {
        queued.current = false;
        try {
          const entries = await Promise.all(
            Object.entries(JSON.parse(key)).map(async ([name, url]) => [
              name,
              (await axios.get(url)).data,
            ]),
          );
          if (active.current) {
            setData(Object.fromEntries(entries));
            setError("");
          }
        } catch (e) {
          if (active.current) setError(errorMessage(e));
        } finally {
          if (active.current) setLoading(false);
        }
      } while (queued.current && active.current);
    };
    pending.current = execute().finally(() => {
      pending.current = null;
    });
    return pending.current;
  }, [key]);
  useEffect(() => {
    active.current = true;
    refresh();
    const timer = setInterval(() => {
      if (!document.hidden) refresh();
    }, 30000);
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active.current = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);
  useEffect(() => {
    if (!socket) return;
    const events = [
      "newBooking",
      "bookingAssigned",
      "bookingUpdated",
      "bookingCancelled",
      "driverAvailabilityChanged",
      "newAssignment",
    ];
    events.forEach((e) => socket.on(e, refresh));
    return () => events.forEach((e) => socket.off(e, refresh));
  }, [socket, refresh]);
  return { ...data, loading, error, refresh };
}
