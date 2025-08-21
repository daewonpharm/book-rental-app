// src/LoginPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  login, logout, watchAuth, isHardcodedAdmin, isFirestoreAdmin
} from "./auth.js";
import { getRedirectResult } from "firebase/auth";
import { auth, authReady } from "./firebase.js";

// 기본 관리자 경로: /console-x7a2k9 (env 있으면 그 값 사용)
const adminPath =
  (import.meta.env.VITE_ADMIN_PATH?.startsWith("/")
    ? import.meta.env.VITE_ADMIN_PATH
    : `/${import.meta.env.VITE_ADMIN_PATH}`) || "/console-x7a2k9";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [checkingRole, setCheckingRole] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // 로그인 성공 후 돌아갈 경로
  const from = useMemo(() => {
    const s = location.state;
    return (s && s.from) || sessionStorage.getItem("nextAfterLogin") || adminPath;
  }, [location]);

  // ✅ 페이지 최초 1회: 퍼시스턴스 보장 후 redirect 결과 회수
  useEffect(() => {
    (async () => {
      await authReady; // 퍼시스턴스 먼저
      try {
        const res = await getRedirectResult(auth);
        if (res?.user) {
          // 필요하면 여기서 추가 후처리
          // console.log("Redirect 로그인 결과:", res.user.uid);
        }
      } catch (e) {
        // auth/no-auth-event 는 무시
        if (e?.code !== "auth/no-auth-event") {
          console.error("getRedirectResult error:", e);
        }
      }
    })();
  }, []);

  // 전역 인증 상태 구독
  useEffect(() => watchAuth(setUser), []);

  // 관리자 권한 확인(하드코딩 → roles 문서 순서)
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    let mounted = true;
    (async () => {
      setCheckingRole(true);
      let ok = isHardcodedAdmin(user);
      if (!ok) {
        try {
          ok = await isFirestoreAdmin(user);
        } catch (e) {
          console.error("roles 확인 오류:", e);
        }
      }
      if (mounted) { setIsAdmin(ok); setCheckingRole(false); }
    })();
    return () => { mounted = false; };
  }, [user]);

  // ✅ 로그인 + 관리자면 원래 목적지로 복귀 (세션 키도 정리)
  useEffect(() => {
    if (user && !checkingRole && isAdmin) {
      const target = from || adminPath;
      sessionStorage.removeItem("nextAfterLogin");
      navigate(target, { replace: true });
    }
  }, [user, checkingRole, isAdmin, from, navigate]);

  // 버튼: 로그인 직전 목적지 저장 후 리다이렉트
  const handleLogin = async () => {
    sessionStorage.setItem("nextAfterLogin", from || adminPath);
    await login();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>관리자 로그인</h2>

      {!user ? (
        <button onClick={handleLogin} style={{ padding: "8px 12px", marginTop: 8 }}>
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
