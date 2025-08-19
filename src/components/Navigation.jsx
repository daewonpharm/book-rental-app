// src/components/Navigation.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Icons } from "../constants/icons";

/**
 * 상단 네비게이션: 📋 도서 목록 / 📤 대여 / 📥 반납
 * - 현재 경로(active) 자동 하이라이트
 * - 모바일에서도 가로폭 꽉 차도록 3등분 그리드
 */
export default function Navigation({ className = "" }) {
  const { pathname } = useLocation();

  const items = [
    { to: "/booklist", label: "도서 목록", icon: Icons.list, key: "booklist" },
    { to: "/rent",     label: "대여",     icon: Icons.rent, key: "rent" },
    { to: "/return",   label: "반납",     icon: Icons.return, key: "return" },
  ];

  return (
    <nav className={`grid grid-cols-3 gap-2 ${className}`}>
      {items.map((item) => {
        const active = pathname.startsWith(item.to);
        return (
          <Link
            key={item.key}
            to={item.to}
            aria-current={active ? "page" : undefined}
            className={
              "text-center rounded-xl border px-3 py-2 text-sm font-medium " +
              (active
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50")
            }
          >
            <span aria-hidden className="mr-1">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
