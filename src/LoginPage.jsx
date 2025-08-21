// src/LoginPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login, logout, watchAuth, isHardcodedAdmin, isFirestoreAdmin } from "./auth.js";

const adminPath = (import.meta.env.VITE_ADMIN_PATH?.startsWith("/") ? import.meta.env.VITE_ADMIN_PATH : `/${import.meta.env.VITE_ADMIN_PATH}`) || "/admin";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [checkingRole, setCheckingRole] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const from = useMemo(() => {
    // 가드에서 건네준 목적지(비공개 경로) 우선
    const s = location.state?.from;
    return (typeof s === "string" && s.startsWith("/")) ? s : adminPath;
  }, [location.state, adminPath]);

  useEffect(() => watchAuth(setUser), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) { setIsAdmin(false); return; }
      setCheckingRole(true);
      let ok = isHardcodedAdmin(user);
      if (!ok) { try { ok = await isFirestoreAdmin(user); } catch (e) { console.error(e); } }
      if (mounted) { setIsAdmin(ok); setCheckingRole(false); }
    })();
    return () => { mounted = false; };
  }, [user]);

  // ✅ 로그인 + 관리자면 자동으로 원래 가려던 경로로 이동
  useEffect(() => {
    if (user && !checkingRole && isAdmin) {
      navigate(from, { replace: true });
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
