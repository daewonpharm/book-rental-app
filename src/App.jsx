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
      <div className="w-screen min-h-screen overflow-x-hidden bg-white">
        <div className="flex flex-col items-center px-4">
          <div className="w-full max-w-screen-sm">
            
            {/* ✅ 상단 로고 */}
            <div className="flex justify-center items-center py-4">
              <img src="/logo.png" alt="회사 로고" className="h-12" />
            </div>

            <Navigation />
          </div>

          <div className="w-full max-w-screen-sm">
            <Routes>
              <Route path="/" element={<BookList />} />
              <Route path="/rent" element={<Rent />} />
              <Route path="/return" element={<Return />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}
