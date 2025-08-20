// src/LoginPage.jsx
import { useEffect, useState } from "react";
import { login, logout, watchAuth, consumeRedirectOnce } from "./auth";

export default function LoginPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // redirect 경로였다면 결과 회수하여 세션 완성
    consumeRedirectOnce();
    // 인증 상태 구독
    const un = watchAuth(setUser);
    return () => un();
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: "40px auto" }}>
      <h2 style={{ marginBottom: 12 }}>관리자 로그인</h2>

      {user ? (
        <div>
          <p style={{ margin: "8px 0" }}>
            로그인됨: <b>{user.email}</b>
          </p>
          <button onClick={logout} style={{ padding: "8px 12px" }}>
            로그아웃
          </button>
        </div>
      ) : (
        <div>
          <p style={{ margin: "8px 0" }}>로그인이 필요합니다.</p>
          <button onClick={login} style={{ padding: "8px 12px" }}>
            구글로 로그인
          </button>
        </div>
      )}
    </div>
  );
}
