// src/LoginPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  login, logout, watchAuth, isHardcodedAdmin, isFirestoreAdmin
} from "./auth.js";
import { getRedirectResult } from "firebase/auth";
import { auth } from "./firebase.js";

const adminPath =
  (import.meta.env.VITE_ADMIN_PATH?.startsWith("/")
    ? import.meta.env.VITE_ADMIN_PATH
    : `/${import.meta.env.VITE_ADMIN_PATH}`) || "/admin";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [checkingRole, setCheckingRole] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 가드가 넘겨준 from(있을 때 우선), 없으면 세션 저장값, 그것마저 없으면 비공개 경로
  const from = useMemo(() => {
    const s = location.state?.from;
    const ss = sessionStorage.getItem("nextAfterLogin");
    return (typeof s === "string" && s.startsWith("/"))
      ? s
      : (typeof ss === "string" && ss.startsWith("/"))
        ? ss
        : adminPath;
  }, [location.state, adminPath]);

  // 리다이렉트 로그인 결과 수거 (오류는 무시)
  useEffect(() => {
    (async () => {
      try { await getRedirectResult(auth); } catch (_) {}
    })();
  }, []);

  // 사용자 상태 구독
  useEffect(() => watchAuth(setUser), []);

  // 권한 확인
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) { setIsAdmin(false); return; }
      setCheckingRole(true);
      let ok = isHardcodedAdmin(user);
      if (!ok) {
        try { ok = await isFirestoreAdmin(user); } catch (e) { console.error("roles 확인 오류:", e); }
      }
      if (mounted) { setIsAdmin(ok); setCheckingRole(false); }
    })();
    return () => { mounted = false; };
  }, [user]);

  // ✅ 로그인 + 관리자면 원래 목적지로 복귀 (세션 키도 정리)
  useEffect(() => {
    if (user && !checkingRole && isAdmin) {
      const target = from;
      sessionStorage.removeItem("nextAfterLogin");
      navigate(target, { replace: true });
    }
  }, [user, checkingRole, isAdmin, from, navigate]);

  return (
    <div style={{ padding: 24 }}>
      <h2>관리자 로그인</h2>

      {!user ? (
        <button onClick={login} style={{ padding: "8px 12px" }}>
          Google 계정으로 로그인
        </button>
      ) : (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginTop: 8 }}>
            <button onClick={logout} style={{ padding: "6px 10px" }}>로그아웃</button>
          </div>
          <div style={{ marginTop: 16 }}>
            {checkingRole ? "권한 확인 중..." : (isAdmin ? "✅ 관리자 권한" : "❌ 관리자 아님")}
          </div>
        </div>
      )}
    </div>
  );
}
