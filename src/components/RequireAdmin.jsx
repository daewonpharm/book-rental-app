import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.js";
import { isHardcodedAdmin, isFirestoreAdmin } from "../auth.js";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const [user, setUser] = useState(null);

  // ✅ onAuthStateChanged가 최초 1회라도 호출되었는지
  const [authReady, setAuthReady] = useState(false);

  // 권한 체크 진행 상태/결과
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  // 1) 로그인 상태 구독 + 최초 초기화 완료 플래그
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true); // ← 초기화 완료!
    });
    return () => unsub();
  }, []);

  // 2) 사용자 바뀔 때 권한 검사
  useEffect(() => {
    let mounted = true;

    (async () => {
      // 아직 초기화 전이면 아무 것도 하지 않음
      if (!authReady) return;

      // 초기화 후 사용자 없으면 권한 없음
      if (!user) {
        if (mounted) {
          setAllowed(false);
          setChecking(false);
        }
        return;
      }

      setChecking(true);
      let ok = isHardcodedAdmin(user);
      if (!ok) {
        try {
          ok = await isFirestoreAdmin(user);
        } catch (e) {
          console.error("roles 체크 실패:", e);
        }
      }
      if (mounted) {
        setAllowed(ok);
        setChecking(false);
      }
    })();

    return () => { mounted = false; };
  }, [user, authReady]);

  // ✅ 아직 auth 초기화 전이면 리다이렉트 금지 (로딩만)
  if (!authReady) return <div style={{ padding: 24 }}>권한 확인 중...</div>;

  // 초기화는 됐는데 사용자 자체가 없으면 로그인으로
  if (!user) return <Navigate to="/login" replace />;

  // 사용자 있지만 권한 확인 중이면 로딩
  if (checking) return <div style={{ padding: 24 }}>권한 확인 중...</div>;

  // 권한 없음
  if (!allowed) return <div style={{ padding: 24 }}>🚫 권한이 없습니다.</div>;

  // 통과
  return children;
}
