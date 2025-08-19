// src/components/BottomNav.jsx (또는 Navigation.jsx)
import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const base = "flex flex-col items-center justify-center gap-1 text-xs font-medium";
  const active = "text-blue-600";
  const inactive = "text-gray-500";

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <ul className="grid grid-cols-4 h-16">
        <li>
          <NavLink to="/" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
            <span className="text-xl" aria-hidden>🏠</span>
            <span>홈</span>
          </NavLink>
        </li>

        {/* ▼ 여기: '목록' → '도서목록' + 아이콘 📚 */}
        <li>
          <NavLink to="/booklist" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
            <span className="text-xl" aria-hidden>📚</span>
            <span>도서목록</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/rent" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
            <span className="text-xl" aria-hidden>📷</span>
            <span>대여</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/return" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
            <span className="text-xl" aria-hidden>↩️</span>
            <span>반납</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
