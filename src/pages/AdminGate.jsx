// src/pages/AdminGate.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminGate() {
  const navigate = useNavigate();

  useEffect(() => {
    const password = prompt("🔐 관리자 비밀번호를 입력하세요:");
    if (password === "70687068") {
      localStorage.setItem("adminAccess", "true");
      navigate("/admin");
    } else {
      alert("❌ 비밀번호가 틀렸습니다.");
      navigate("/");
    }
  }, [navigate]); // ✅ navigate 의존성 추가

  return <div className="text-center mt-10 text-gray-600">접속 확인 중입니다...</div>;
}
