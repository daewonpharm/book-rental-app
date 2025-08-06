// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Rent from "./pages/Rent";
import Return from "./pages/Return";
import Admin from "./pages/Admin";
import BookList from "./pages/BookList";
import NotFound from "./pages/NotFound"; // ✅ 404 페이지

function App() {
  return (
    <Router>
      <div className="p-4">
        <Navigation />
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/rent" element={<Rent />} />
          <Route path="/return" element={<Return />} />

          {/* ✅ 관리자 접근 여부 조건부 렌더링 */}
          <Route
            path="/admin"
            element={
              localStorage.getItem("adminAccess") === "true" ? (
                <Admin />
              ) : (
                <NotFound />
              )
            }
          />

          {/* ❌ 존재하지 않는 경로 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

// ✅ 관리자 메뉴는 완전히 숨기고, 일반 메뉴만 렌더링
function Navigation() {
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "도서목록" },
    { path: "/rent", label: "대여" },
    { path: "/return", label: "반납" },
    // ❌ 관리자 메뉴는 목록에서 제외
  ];

  return (
    <nav className="flex flex-wrap gap-4 mb-6">
      {menuItems.map(({ path, label }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`px-4 py-2 rounded font-bold text-white text-center
              ${isActive ? "bg-blue-800" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default App;
