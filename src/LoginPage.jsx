// src/LoginPage.jsx
import { useEffect, useState } from "react";
import { login, logout, watchAuth } from "./auth";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  useEffect(() => watchAuth(setUser), []);

  const copy = (text) => navigator.clipboard.writeText(text);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Apple SD Gothic Neo, sans-serif" }}>
      <h2 style={{ marginBottom: 16 }}>관리자 로그인</h2>

      {user ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, color: "#666" }}>Email</div>
            <code style={{ fontSize: 14 }}>{user.email}</code>
            <button style={{ marginLeft: 8 }} onClick={() => copy(user.email)}>복사</button>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666" }}>UID</div>
            <code style={{ fontSize: 14 }}>{user.uid}</code>
            <button style={{ marginLeft: 8 }} onClick={() => copy(user.uid)}>복사</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={logout}>로그아웃</button>
          </div>
        </div>
      ) : (
        <button onClick={login}>Sign in with Google</button>
      )}
    </div>
  );
}
