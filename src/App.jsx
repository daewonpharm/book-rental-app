// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Rent from "./pages/Rent";
import Return from "./pages/Return";
import Admin from "./pages/Admin";
import BookList from "./pages/BookList";

function App() {
  return (
    <Router>
      <div className="p-4">
        <Navigation />
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/rent" element={<Rent />} />
          <Route path="/return" element={<Return />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

// ✅ 메뉴 컴포넌트
function Navigation() {
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "도서목록" },
    { path: "/rent", label: "대여" },
    { path: "/return", label: "반납" },
    { path: "/admin", label: "관리자" },
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
