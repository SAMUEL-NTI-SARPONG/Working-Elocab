import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { errorMessage } from "../context/AuthContext";
export default function useAction() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async (action, message) => {
    if (lock.current) return { ok: false };
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await action();
      if (message) toast.success(message);
      return { ok: true, data: result?.data ?? result };
    } catch (e) {
      const text = errorMessage(e);
      setError(text);
      toast.error(text);
      return { ok: false };
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return { busy, error, run };
}
