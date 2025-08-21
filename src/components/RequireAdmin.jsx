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

  // 로그인 상태 구독 + 초기화 완료 플래그
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // 권한 검사
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

  // ⛳ 로그인 안 된 상태에서 /login 으로 넘길 때,
  //     리다이렉트 후 돌아올 목적지를 세션에 저장 (state가 유실되어도 복구 가능)
  if (authReady && !user) {
    sessionStorage.setItem("nextAfterLogin", location.pathname);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!authReady || checking) return <div style={{ padding: 24 }}>권한 확인 중...</div>;
  if (!allowed) return <div style={{ padding: 24 }}>🚫 권한이 없습니다.</div>;
  return children;
}
