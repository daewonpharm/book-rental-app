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
    const pw = prompt("\ud83d\udd10 \uad00\ub9ac\uc790 \ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud558\uc138\uc694");
    if (pw === "70687068") {
      localStorage.setItem("adminAccess", "true");
      navigate("/admin");
    } else {
      alert("\u274c \ube44\ubc00\ubc88\ud638\uac00 \ud2c0\ub838\uc2b5\ub2c8\ub2e4.");
    }
  };

  const filtered = books
    .filter((book) => book.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((book) => (filterAvailable ? book.available !== false : true))
    .sort((a, b) => (sortByRating ? (b.avgRating || 0) - (a.avgRating || 0) : 0));

  const getDueDate = (book) => {
    if (!book.available && book.rentedAt?.toDate) {
      const due = book.rentedAt.toDate();
      due.setDate(due.getDate() + 14);
      return due.toLocaleDateString();
    }
    return "–";
  };

  return (
    <div className="w-screen flex justify-center px-4 min-h-screen">
      <div className="w-full max-w-screen-sm space-y-6">
        <h2 className="text-xl font-bold text-center">📚 도서 목록</h2>

        {/* 검색 및 필터 */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="제목 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 w-full text-sm sm:text-base"
          />
          <div className="flex flex-wrap gap-3 text-sm sm:text-base">
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
        </div>

        {/* 도서 목록 테이블 */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-[600px] w-full table-auto border-collapse border text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border px-2 py-1">제목</th>
                <th className="border px-2 py-1">상태</th>
                <th className="border px-2 py-1">반납 예정일</th>
                <th className="border px-2 py-1">⭐</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((book) => (
                <tr key={book.id} className="border-t">
                  <td
                    className="px-2 py-1 truncate max-w-[140px] cursor-pointer hover:underline"
                    onClick={() => {
                      if (book.title === "미키7") handleMickeyClick();
                    }}
                  >
                    {book.title}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    {book.available === false ? (
                      <span className="text-red-500 font-semibold">❌ 대출 중</span>
                    ) : (
                      <span className="text-green-600 font-semibold">✅ 대출 가능</span>
                    )}
                  </td>
                  <td className="px-2 py-1 text-gray-600 whitespace-nowrap">
                    {getDueDate(book)}
                  </td>
                  <td className="px-2 py-1 text-center whitespace-nowrap">
                    {book.avgRating ? `⭐ ${book.avgRating.toFixed(1)}` : "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 인기 대여 TOP 5 */}
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-2">🔥 인기 대여 TOP 5</h3>
          <table className="min-w-[400px] w-full table-auto border-collapse border text-sm sm:text-base overflow-x-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">순위</th>
                <th className="border px-2 py-1">제목</th>
                <th className="border px-2 py-1">횟수</th>
              </tr>
            </thead>
            <tbody>
              {topTitles.map(([title, count], idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 font-bold text-blue-600">{idx + 1}</td>
                  <td className="border px-2 py-1 whitespace-nowrap text-sm">{title}</td>
                  <td className="border px-2 py-1 text-center text-gray-700">{count}회</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
