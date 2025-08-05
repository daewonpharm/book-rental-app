// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Rent from "./pages/Rent";
import Return from "./pages/Return";
import Admin from "./pages/Admin";
import BookList from "./pages/BookList"; // 도서목록 페이지

export default function App() {
  return (
    <Router>
      <div className="p-4">
        <nav className="mb-6 space-x-4">
          <Link to="/">도서목록</Link>
          <Link to="/rent">대여</Link>
          <Link to="/return">반납</Link>
          <Link to="/admin">관리자</Link>
        </nav>
        <Routes>
          <Route path="/" element={<BookList />} />  {/* 루트 경로를 도서목록으로 변경 */}
          <Route path="/rent" element={<Rent />} />
          <Route path="/return" element={<Return />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}
