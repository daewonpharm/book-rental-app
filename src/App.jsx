import React from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import BookList from "./pages/BookList";
import Rent from "./pages/Rent";
import Return from "./pages/Return";
import "./styles/global.css"; // ensure loaded

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const Tab = ({ to, label, icon }) => (
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
    <header className="w-screen sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="w-screen flex justify-center">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl flex items-center justify-between px-4 py-3">
          <button onClick={()=>navigate("/")} className="flex items-center gap-2 font-semibold text-gray-900">
            <span>📚</span><span>DW Library</span>
          </button>
          <nav className="hidden sm:flex items-center gap-1">
            <Tab to="/"       label="Home"  icon="🏠" />
            <Tab to="/books"  label="목록"   icon="📖" />
            <Tab to="/rent"   label="대여"   icon="📷" />
            <Tab to="/return" label="반납"   icon="🔁" />
          </nav>
        </div>
      </div>
    </header>
  );
}

function BaseLayout({ children }) {
  return (
    <main className="w-screen flex justify-center px-4">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl py-6">{children}</div>
    </main>
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
        </Routes>
      </BaseLayout>
    </BrowserRouter>
  );
}
