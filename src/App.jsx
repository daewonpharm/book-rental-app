import React from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import BookList from "./pages/BookList";
import Rent from "./pages/Rent";
import Return from "./pages/Return";
import EnvDebug from "./pages/EnvDebug";
import { Icons } from "./constants/icons";
import "./styles/global.css";

/** 공통 레이아웃 */
function BaseLayout({ children }) {
  return (
    <main className="w-screen flex justify-center px-4">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl py-6">{children}</div>
    </main>
  );
}

/** 상단(데스크톱) + 하단(모바일) 내비게이션 */
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
      {/* 상단 헤더: 데스크톱 전용 */}
      <header className="w-screen sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="w-screen flex justify-center">
          <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl flex items-center justify-between px-4 py-3">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 font-semibold text-gray-900">
              <span>{Icons.books}</span>
              <span>DW Library</span>
            </button>
            <nav className="hidden sm:flex items-center gap-1">
              <TopTab to="/"       label="Home"  icon={Icons.home} />
              <TopTab to="/books"  label="목록"   icon={Icons.books} />
              <TopTab to="/rent"   label="대여"   icon={Icons.rent} />
              <TopTab to="/return" label="반납"   icon={Icons.return} />
            </nav>
          </div>
        </div>
      </header>

      {/* 하단 탭바: 모바일 전용 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:hidden">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {[
            { to: "/",      label: "Home", icon: Icons.home },
            { to: "/books", label: "목록",  icon: Icons.books },
            { to: "/rent",  label: "대여",  icon: Icons.rent },
            { to: "/return",label: "반납",  icon: Icons.return },
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

      {/* 하단 탭바 높이만큼 여백(모바일) */}
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
          <Route path="/rent" element={<Rent />} />
          <Route path="/return" element={<Return />} />
          <Route path="/__env" element={<EnvDebug />} />
        </Routes>
      </BaseLayout>
    </BrowserRouter>
  );
}
