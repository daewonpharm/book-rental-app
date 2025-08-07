// src/pages/BookList.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
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
    } else {
      alert("❌ 비밀번호가 틀렸습니다.");
    }
  };

  const filtered = books
    .filter((book) =>
      book.title?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((book) => (filterAvailable ? book.available !== false : true))
    .sort((a, b) => {
      if (!sortByRating) return 0;
      return (b.avgRating || 0) - (a.avgRating || 0);
    });

  const getDueDate = (book) => {
    if (!book.available && book.rentedAt?.toDate) {
      const due = book.rentedAt.toDate();
      due.setDate(due.getDate() + 14);
      return due.toLocaleDateString();
    }
    return "–";
  };

  return (
    <div className="w-full max-w-screen-sm mx-auto flex flex-col gap-6 px-2">
      {/* 📚 도서 목록 테이블 */}
      <div className="w-full lg:w-2/3">
        <h2 className="text-xl font-bold mb-4">📚 도서 목록</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="제목 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 w-full md:w-1/3"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sortByRating}
              onChange={() => setSortByRating(!sortByRating)}
            />
            <span>⭐ 별점 높은 순</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterAvailable}
              onChange={() => setFilterAvailable(!filterAvailable)}
            />
            <span>✅ 대출 가능만</span>
          </label>
        </div>

        <table className="w-full table-auto border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border px-4 py-2">제목</th>
              <th className="border px-4 py-2 w-[140px]">상태</th>
              <th className="border px-4 py-2 w-[160px]">반납 예정일</th>
              <th className="border px-4 py-2 w-[140px]">평균 별점</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((book) => (
              <tr key={book.id} className="border-t">
                <td
                  className="px-4 py-2"
                  onClick={() => {
                    if (book.title === "미키7") {
                      handleMickeyClick();
                    }
                  }}
                  style={{ cursor: book.title === "미키7" ? "pointer" : "default" }}
                >
                  {book.title}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {book.available === false ? (
                    <span className="text-red-500 font-semibold">❌ 대출 중</span>
                  ) : (
                    <span className="text-green-600 font-semibold">✅ 대출 가능</span>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                  {getDueDate(book)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {book.avgRating ? `⭐ ${book.avgRating.toFixed(1)}` : "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 인기 대여 TOP 5 */}
      <div className="w-full lg:w-1/3 lg:sticky lg:top-4 h-fit mt-[66px]">
        <h3 className="text-lg font-semibold mb-2">🔥 인기 대여 TOP 5</h3>
        <table className="table-auto w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 w-[120px]">순위</th>
              <th className="border px-4 py-2 w-[320px]">제목</th>
              <th className="border px-4 py-2 w-[120px]">횟수</th>
            </tr>
          </thead>
          <tbody>
            {topTitles.map(([title, count], idx) => (
              <tr key={idx}>
                <td className="border px-4 py-2 font-bold text-blue-600">
                  {idx + 1}
                </td>
                <td className="border px-4 py-2 whitespace-nowrap text-sm">
                  {title}
                </td>
                <td className="border px-4 py-2 text-center text-gray-700">
                  {count}회
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
