import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/lib/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;

    (async () => {
      if (!sessionId) {
        navigate("/ai", { replace: true });
        return;
      }
      try {
        await axios.post(`${API}/auth/session`, { session_id: sessionId }, { withCredentials: true });
        await checkAuth();
        // Clean URL
        window.history.replaceState({}, "", "/ai");
        navigate("/ai", { replace: true });
      } catch {
        navigate("/ai", { replace: true });
      }
    })();
  }, [navigate, checkAuth]);

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#0A1410", color: "#F0EADB" }}>
      <div className="text-center">
        <div className="font-display text-2xl">Signing you in…</div>
        <div className="text-sm text-[#B5AD99] mt-2">One moment.</div>
      </div>
    </div>
  );
}
