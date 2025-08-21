import React from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import BookList from "./pages/BookList.jsx";
import Rent from "./pages/Rent.jsx";
import Return from "./pages/Return.jsx";
import EnvDebug from "./pages/EnvDebug.jsx";

import LoginPage from "./LoginPage.jsx";

// 🔒 관리자 가드/페이지
import RequireAdmin from "./components/RequireAdmin.jsx";
import Admin from "./pages/Admin.jsx";

import { Icons } from "./constants/icons.js";
import "./styles/global.css";

// ✅ 비공개 관리자 경로 (.env.local / Vercel)
const RAW_ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || "/admin";
const adminPath = RAW_ADMIN_PATH.startsWith("/") ? RAW_ADMIN_PATH : `/${RAW_ADMIN_PATH}`;

function BaseLayout({ children }) {
  return (
    <main className="w-screen flex justify-center px-4">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl py-6">{children}</div>
    </main>
  );
}

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const TopTab = ({ to, label, icon }) => (
    <NavLink
      to={to}
      className={
        "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium " +
        (location.pathname === to ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100")
      }
    >
      <span className="rounded-lg px-1.5 py-0.5 bg-gray-100">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );

  return (
    <>
      <header className="w-screen sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="w-screen flex justify-center">
          <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl flex items-center justify-between px-4 py-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 font-semibold text-gray-900"
              aria-label="대원책방 홈"
            >
              <img src="/logo.png" alt="대원책방 로고" className="h-6 w-auto md:h-7" />
              <span>대원책방</span>
            </button>
            <nav className="hidden sm:flex items-center gap-1">
              <TopTab to="/"       label="Home"    icon={Icons.home} />
              <TopTab to="/books"  label="도서목록" icon={Icons.list} />
              <TopTab to="/rent"   label="대여"     icon={Icons.rent} />
              <TopTab to="/return" label="반납"     icon={Icons.return} />
              {/* 로그인 탭은 노출하지 않음 */}
            </nav>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:hidden">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {[
            { to: "/",      label: "Home",    icon: Icons.home },
            { to: "/books", label: "도서목록", icon: Icons.list },
            { to: "/rent",  label: "대여",     icon: Icons.rent },
            { to: "/return",label: "반납",     icon: Icons.return },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "flex flex-col items-center py-2 text-xs " + (isActive ? "text-black font-semibold" : "text-gray-600")
              }
            >
              <div className="text-lg">{item.icon}</div>
              <div className="mt-0.5">{item.label}</div>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="h-14 sm:hidden" />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <BaseLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/booklist" element={<BookList />} />
          <Route path="/rent" element={<Rent />} />
          <Route path="/return" element={<Return />} />
          <Route path="/__env" element={<EnvDebug />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ✅ 비공개 관리자 라우트 (환경변수 기반) */}
          <Route
            path={adminPath}
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />

          {/* ❌ /admin 직접 접근은 404처럼 */}
          <Route path="/admin" element={<div style={{ padding: 24 }}>404 Not Found</div>} />

          {/* 나머지 전부 404 */}
          <Route path="*" element={<div style={{ padding: 24 }}>404 Not Found</div>} />
        </Routes>
      </BaseLayout>
    </BrowserRouter>
  );
}
