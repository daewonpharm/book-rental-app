import { useEffect, useState } from "react";
import { login, logout, watchAuth, auth } from "./auth";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  useEffect(() => watchAuth(setUser), []);

  return (
    <div style={{ padding: 24 }}>
      <h2>관리자 로그인</h2>
      {user ? (
        <>
          <p>로그인됨: {user.email}</p>
          <p>UID: <code>{user.uid}</code></p> {/* ← 여기서 UID 복사 가능 */}
          <button onClick={logout}>로그아웃</button>
        </>
      ) : (
        <button onClick={login}>Sign in with Google</button>
      )}
    </div>
  );
}
