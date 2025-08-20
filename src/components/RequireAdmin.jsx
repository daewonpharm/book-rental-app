// src/components/RequireAdmin.jsx
import { useEffect, useState } from "react";
import { watchAuth, isHardcodedAdmin, isFirestoreAdmin } from "../auth";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => watchAuth(setUser), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setAllowed(false);
        setReady(true);
        return;
      }
      // 1) 하드코딩 → 2) roles 순서로 확인
      let ok = isHardcodedAdmin(user);
      if (!ok) {
        try {
          ok = await isFirestoreAdmin(user);
        } catch (e) {
          console.error("roles 체크 실패:", e);
        }
      }
      if (mounted) {
        setAllowed(ok);
        setReady(true);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  if (!ready) return <div style={{ padding: 24 }}>권한 확인 중...</div>;

  if (!user) return <Navigate to="/login" replace />;
  if (!allowed) return <div style={{ padding: 24 }}>🚫 권한이 없습니다.</div>;

  return children;
}
