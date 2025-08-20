// src/LoginPage.jsx
import { useEffect, useState } from "react";
import { login, logout, watchAuth, consumeRedirectOnce } from "./auth";

export default function LoginPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1) 리다이렉트 로그인이라면 결과를 한 번 회수해야 세션이 완성됨
    consumeRedirectOnce();
    // 2) 상태 감시
    const un = watchAuth(setUser);
    return () => un();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>관리자 로그인</h2>

      {user ? (
        <>
          <p>로그인됨: {user.email}</p>
          <button onClick={logout}>로그아웃</button>
        </>
      ) : (
        <>
          <p>로그인이 필요합니다.</p>
          <button onClick={login}>구글로 로그인</button>
        </>
      )}
    </div>
  );
}
