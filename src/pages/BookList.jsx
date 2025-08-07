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

      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([title, count]) => ({ title, count }));

      setTopTitles(sorted);
    };

    fetchBooks();
    fetchTop();
  }, []);

  const filteredBooks = books
    .filter((book) =>
      book.title?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((book) => (filterAvailable ? book.available : true))
    .sort((a, b) =>
      sortByRating
        ? (b.avgRating || 0) - (a.avgRating || 0)
        : a.title.localeCompare(b.title)
    );

  const handleAdminAccess = () => {
    const password = prompt("관리자 비밀번호를 입력하세요:");
    if (password === "70687068") {
      navigate("/admin");
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  return (
    <div className="min-h-screen w-full px-4 flex justify-center">
      <div className="w-full max-w-md space-y-6">
        <h2 className="text-xl font-bold mt-6">📚 도서 목록</h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="도서 제목 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 w-full"
          />
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={sortByRating}
                onChange={() => setSortByRating(!sortByRating)}
              />
              별점순
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={filterAvailable}
                onChange={() => setFilterAvailable(!filterAvailable)}
              />
              대여 가능만
            </label>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-1">🔥 인기 대여 TOP 5</h3>
          <ul className="text-sm list-disc list-inside">
            {topTitles.map((item, index) => (
              <li key={index}>
                {item.title} ({item.count}회 대여)
              </li>
            ))}
          </ul>
        </div>

        <table className="w-full table-auto border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">제목</th>
              <th className="border px-2 py-1">별점</th>
              <th className="border px-2 py-1">상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book) => (
              <tr key={book.id}>
                <td
                  className={`border px-2 py-1 truncate ${
                    book.title === "미키7"
                      ? "text-blue-600 cursor-pointer"
                      : ""
                  }`}
                  onClick={() =>
                    book.title === "미키7" && handleAdminAccess()
                  }
                >
                  {book.title}
                </td>
                <td className="border px-2 py-1 text-center">
                  {book.avgRating ? `⭐ ${book.avgRating.toFixed(1)}` : "—"}
                </td>
                <td
                  className={`border px-2 py-1 text-center font-semibold ${
                    book.available ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {book.available ? "대여 가능" : "대여 중"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="h-8" />
      </div>
    </div>
  );
}
