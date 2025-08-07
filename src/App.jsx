// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Rent from "./pages/Rent";
import Return from "./pages/Return";
import Admin from "./pages/Admin";
import BookList from "./pages/BookList";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center px-4">
        <Navigation />
        <div className="w-full max-w-screen-sm">
          <Routes>
            <Route path="/" element={<BookList />} />
            <Route path="/rent" element={<Rent />} />
            <Route path="/return" element={<Return />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function Navigation() {
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "도서목록" },
    { path: "/rent", label: "대여" },
    { path: "/return", label: "반납" },
  ];

  return (
    <nav className="w-full max-w-screen-sm flex justify-around bg-blue-100 rounded-md py-3 mb-6">
      {menuItems.map(({ path, label }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`px-4 py-2 rounded font-bold text-white text-center ${
              isActive ? "bg-blue-800" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default App;
