import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [sortByRating, setSortByRating] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const snapshot = await getDocs(collection(db, "books"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBooks(data);
    })().catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    let list = books;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => (b.title || b.name || "").toLowerCase().includes(q));
    }
    if (filterAvailable) {
      list = list.filter((b) => {
        const status = b.status || (b.isAvailable === false ? "대출중" : "대출가능");
        return status !== "대출중";
      });
    }
    if (sortByRating) list = [...list].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    return list;
  }, [books, search, filterAvailable, sortByRating]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold">도서목록 📚</h1>
      </header>

      <div className="rounded-2xl bg-white border border-gray-200 p-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목 검색"
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setSortByRating((v) => !v)}
              className={"px-3 py-2 rounded-xl text-sm border " + (sortByRating ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-800 border-gray-300")}
            >
              ⭐ 평점정렬
            </button>
            <button
              onClick={() => setFilterAvailable((v) => !v)}
              className={"px-3 py-2 rounded-xl text-sm border " + (filterAvailable ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-800 border-gray-300")}
            >
              대출가능만
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm divide-y">
        {filtered.map((b) => {
          const title = b.title || b.name || b.id;
          const status = b.status || (b.isAvailable === false ? "대출중" : "대출가능");
          const due = b.dueDate || b.dueAt || b.due || null;
          const dueStr = due ? (due.toDate ? due.toDate() : new Date(due)).toLocaleDateString() : "";
          const rating = b.avgRating ? Number(b.avgRating).toFixed(1) : null;
          return (
            <article key={b.id} className="p-4">
              <div className="font-semibold text-gray-900 line-clamp-1">{title}</div>
              <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                <span className={"inline-flex items-center rounded-md px-2 py-0.5 text-[11px] border " + (status === "대출중" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200")}>{status}</span>
                {status === "대출중" && dueStr && <span>반납 예정일 {dueStr}</span>}
                {rating && <span>• ⭐ {rating}</span>}
              </div>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
