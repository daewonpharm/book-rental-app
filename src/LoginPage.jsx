// src/LoginPage.jsx
import { useEffect, useState } from "react";
import { login, logout, watchAuth, consumeRedirectOnce } from "./auth";

export default function LoginPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 돌아왔다면 redirect 결과 회수 → 세션 완성
    consumeRedirectOnce();

    // 인증 상태 구독
    const un = watchAuth(setUser);

    // 아직 로그인 안 했고, 이번 탭에서 자동 시도를 안 했다면 즉시 리다이렉트
    const tried = sessionStorage.getItem("__login_redirect_tried__");
    if (!tried) {
      sessionStorage.setItem("__login_redirect_tried__", "1");
      // 자동 리다이렉트 (팝업 경로 완전 제거)
      login();
    }
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
          <p style={{ margin: "8px 0" }}>
            로그인 창으로 자동 이동 중입니다…
            <br />
            (차단되면 아래 버튼으로 다시 시도)
          </p>
          <button onClick={login} style={{ padding: "8px 12px" }}>
            구글로 로그인
          </button>
        </div>
      )}
    </div>
  );
}
