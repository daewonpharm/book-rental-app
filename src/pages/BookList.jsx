// src/pages/BookList.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByRating, setSortByRating] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [topTitles, setTopTitles] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const snapshot = await getDocs(collection(db, "books"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBooks(data);
    };

    const fetchTop = async () => {
      const snapshot = await getDocs(collection(db, "rentLogs"));
      const counts = {};
      snapshot.docs.forEach((doc) => {
        const title = doc.data().title;
        counts[title] = (counts[title] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      setTopTitles(sorted.slice(0, 5));
    };

    fetchBooks();
    fetchTop();
  }, []);

  const handleMickeyClick = () => {
    const pw = prompt("🔐 관리자 비밀번호를 입력하세요");
    if (pw === "70687068") {
      localStorage.setItem("adminAccess", "true");
      navigate("/admin");
    } else if (pw !== null) {
      // 취소(null)인 경우는 조용히 무시
      alert("❌ 비밀번호가 틀렸습니다.");
    }
  };

  const filtered = books
    .filter((book) =>
      (book.title || "")
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
    )
    .filter((book) => (filterAvailable ? book.available !== false : true))
    .sort((a, b) => {
      if (!sortByRating) return 0;
      return (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0);
    });

  const getDueDate = (book) => {
    if (book.available === false && book.rentedAt?.toDate) {
      const due = book.rentedAt.toDate();
      due.setDate(due.getDate() + 14);
      return due.toLocaleDateString();
    }
    return "–";
  };

  return (
    <div className="flex justify-center px-4 min-h-screen">
      <div className="w-full max-w-md space-y-6 pb-8">
        {/* Header */}
        <div className="pt-4">
          <h2 className="text-xl font-bold">📚 도서 목록</h2>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="제목 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filterAvailable}
                onChange={() => setFilterAvailable((v) => !v)}
              />
              <span>✅ 대출 가능만</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sortByRating}
                onChange={() => setSortByRating((v) => !v)}
              />
              <span>⭐ 별점 높은 순</span>
            </label>
          </div>
        </div>

        {/* 도서 목록 - 카드/리스트형 (제목 아래 상태+반납일) */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="text-5xl mb-3">📚</div>
              <div className="text-base font-semibold mb-1">도서가 없어요</div>
              <div className="text-sm text-gray-500">
                검색어를 바꾸거나 필터를 해제해보세요.
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((book) => (
                <li key={book.id}>
                  <button
                    className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50"
                    onClick={() => {
                      if (book.title === "미키7") handleMickeyClick();
                    }}
                    style={{
                      cursor:
                        book.title === "미키7" ? "pointer" : "default",
                    }}
                  >
                    {/* 본문 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium leading-5 whitespace-normal break-words">
                        {book.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 leading-4">
                        {book.available === false ? (
                          <>
                            ❌ 대출 중 · 반납 예정일 {getDueDate(book)}
                          </>
                        ) : (
                          <>✅ 대출 가능</>
                        )}
                      </div>
                    </div>
                    {/* 오른쪽 메타 (별점) */}
                    <div className="shrink-0 text-sm text-gray-700 ml-2 mt-0.5">
                      {book.avgRating
                        ? `⭐ ${Number(book.avgRating).toFixed(1)}`
                        : "–"}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 인기 대여 TOP 5 */}
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-2">🔥 인기 대여 TOP 5</h3>
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {topTitles.map(([title, count], idx) => (
                <li
                  key={`${title}-${idx}`}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="text-sm whitespace-normal break-words">
                      {title}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{count}회</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
