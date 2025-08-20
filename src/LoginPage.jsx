import { useEffect, useState } from "react";
import { login, logout, watchAuth, consumeRedirectResult } from "./auth";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | checking | done

  useEffect(() => {
    // 1) redirect로 돌아왔으면 결과를 수거
    (async () => {
      setStatus("checking");
      const u = await consumeRedirectResult();
      if (u) setUser(u);
      setStatus("done");
    })();

    // 2) 실시간 상태 감시
    const unsub = watchAuth((u) => setUser(u));
    return () => unsub();
  }, []);

  const copy = (t) => navigator.clipboard?.writeText(t);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Apple SD Gothic Neo, sans-serif" }}>
      <h2 style={{ marginBottom: 12 }}>관리자 로그인</h2>

      {user ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, color: "#666" }}>Email</div>
            <code>{user.email}</code>
            <button style={{ marginLeft: 8 }} onClick={() => copy(user.email)}>복사</button>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666" }}>UID</div>
            <code>{user.uid}</code>
            <button style={{ marginLeft: 8 }} onClick={() => copy(user.uid)}>복사</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={logout}>로그아웃</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <button onClick={login}>Sign in with Google</button>
          <small style={{ color: "#888" }}>
            팝업이 자동으로 닫히거나 실패하면 자동으로 리다이렉트 로그인으로 전환돼요.
            브라우저의 “제3자 쿠키 차단”이 켜져 있으면 팝업이 실패할 수 있어요.
          </small>
        </div>
      )}
    </div>
  );
}
