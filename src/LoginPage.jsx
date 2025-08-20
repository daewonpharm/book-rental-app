// src/LoginPage.jsx
import { useEffect, useState } from "react";
import { login, logout, watchAuth, isHardcodedAdmin, isFirestoreAdmin } from "./auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [checkingRole, setCheckingRole] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => watchAuth(setUser), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      setCheckingRole(true);

      // 1) 하드코딩 우선 확인
      let ok = isHardcodedAdmin(user);

      // 2) roles 컬렉션이 있다면 추가로 확인(확장)
      if (!ok) {
        try {
          ok = await isFirestoreAdmin(user);
        } catch (e) {
          console.error("roles 확인 중 오류:", e);
        }
      }

      if (mounted) {
        setIsAdmin(ok);
        setCheckingRole(false);
      }
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
          <div>이메일: <strong>{user.email}</strong></div>
          <div>UID: <code>{user.uid}</code></div>
          <div style={{ marginTop: 8 }}>
            <button onClick={logout} style={{ padding: "6px 10px" }}>로그아웃</button>
          </div>

          <div style={{ marginTop: 16 }}>
            {checkingRole ? "권한 확인 중..." : (isAdmin ? "✅ 관리자 권한" : "❌ 관리자 아님")}
          </div>

          {isAdmin && (
            <div style={{ marginTop: 16 }}>
              <button onClick={() => navigate("/admin")} style={{ padding: "8px 12px" }}>
                관리자 페이지로 이동
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
