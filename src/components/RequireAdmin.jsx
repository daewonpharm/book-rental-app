// src/components/RequireAdmin.jsx
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.js";
import { isHardcodedAdmin, isFirestoreAdmin } from "../auth.js";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!authReady) return;
      if (!user) { setAllowed(false); setChecking(false); return; }
      setChecking(true);
      let ok = isHardcodedAdmin(user);
      if (!ok) { try { ok = await isFirestoreAdmin(user); } catch (e) { console.error(e); } }
      if (mounted) { setAllowed(ok); setChecking(false); }
    })();
    return () => { mounted = false; };
  }, [user, authReady]);

  if (!authReady) return <div style={{ padding: 24 }}>권한 확인 중...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (checking) return <div style={{ padding: 24 }}>권한 확인 중...</div>;
  if (!allowed) return <div style={{ padding: 24 }}>🚫 권한이 없습니다.</div>;
  return children;
}
