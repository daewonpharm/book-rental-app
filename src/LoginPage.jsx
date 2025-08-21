import { useEffect, useState } from "react";
import { login, logout, watchAuth, isHardcodedAdmin, isFirestoreAdmin } from "./auth.js";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [checkingRole, setCheckingRole] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => watchAuth(setUser), []);

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

  return (
    <div style={{ padding: 24 }}>
      <h2>관리자 로그인</h2>

      {!user ? (
        <button onClick={login} style={{ padding: "8px 12px" }}>
          Google 계정으로 로그인
        </button>
      ) : (
        <div style={{ marginTop: 16 }}>
          {/* 이메일/UID 표시는 제거 */}
          <div style={{ marginTop: 8 }}>
            <button onClick={logout} style={{ padding: "6px 10px" }}>로그아웃</button>
          </div>

          <div style={{ marginTop: 16 }}>
            {checkingRole ? "권한 확인 중..." : (isAdmin ? "✅ 관리자 권한" : "❌ 관리자 아님")}
          </div>

          {/* 보안을 위해 '관리자 페이지 이동' 버튼 제공하지 않음 (비공개 URL 직접 입력) */}
          {isAdmin && (
            <p style={{ marginTop: 8, color: "#666" }}>
              관리자 페이지는 비공개 경로를 직접 입력해서 접속하세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
