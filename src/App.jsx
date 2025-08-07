// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import BookList from "./pages/BookList";
import Rent from "./pages/Rent";
import Return from "./pages/Return";
import Admin from "./pages/Admin";

function Navigation() {
  return (
    <nav className="flex justify-around w-full bg-blue-100 p-2 mb-6 rounded-md">
      <Link to="/" className="bg-blue-600 text-white px-4 py-1 rounded">도서목록</Link>
      <Link to="/rent" className="bg-blue-600 text-white px-4 py-1 rounded">대여</Link>
      <Link to="/return" className="bg-blue-600 text-white px-4 py-1 rounded">반납</Link>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="w-screen min-h-screen flex flex-col items-center px-4">
        {/* ✅ 상단 메뉴도 가운데 정렬되도록 max-w 설정 */}
        <div className="w-full max-w-screen-sm">
          <Navigation />
        </div>

        {/* ✅ 본문 콘텐츠도 같은 기준으로 정렬 */}
        <div className="w-full max-w-screen-sm">
          <Routes>
            <Route path="/" element={<BookList />} />
            <Route path="/rent" element={<Rent />} />
            <Route path="/return" element={<Return />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
