// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { db } from "../firebase.js";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

/** Firestore Timestamp | string | null -> 보기 좋은 날짜/시간 */
function fmt(ts) {
  if (!ts) return "-";
  try {
    if (typeof ts?.toDate === "function") return ts.toDate().toLocaleString();
    const d = new Date(ts);
    if (!isNaN(d.getTime())) return d.toLocaleString();
  } catch {
    /* no-op */
  }
  return String(ts);
}

export default function Admin() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ✅ 의존성 안전: useCallback으로 고정
  const fetchLogs = useCallback(async () => {
    setError("");
    setRefreshing(true);
    try {
      const q = query(collection(db, "rentLogs"), orderBy("rentedAt", "desc"), limit(200));
      const snap = await getDocs(q);
      const rows = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLogs(rows);
    } catch (e) {
      console.error(e);
      setError(e?.message || "기록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const top5 = useMemo(() => {
    const counts = new Map();
    logs.forEach((r) => {
      const title = r.title || r.bookTitle || r.book?.title || "(제목없음)";
      counts.set(title, (counts.get(title) || 0) + 1);
    });
    const arr = Array.from(counts.entries()).map(([title, count]) => ({ title, count }));
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, 5);
  }, [logs]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">관리자 대시보드</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            {refreshing ? "새로고침 중…" : "새로고침"}
          </button>
        </div>
      </header>

      {/* 인기 도서 TOP 5 */}
      <section className="border rounded-2xl p-4">
        <h2 className="font-semibold mb-3">📈 인기 대여 TOP 5</h2>
        {top5.length === 0 ? (
          <div className="text-sm text-gray-500">데이터가 없습니다.</div>
        ) : (
          <ol className="list-decimal ml-5 space-y-1">
            {top5.map((item, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="truncate">{item.title}</span>
                <span className="tabular-nums text-gray-700">{item.count}회</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* 누적 대여 로그 */}
      <section className="border rounded-2xl p-4">
        <h2 className="font-semibold mb-3">📚 누적 대여 기록 (최근 200건)</h2>

        {loading ? (
          <div className="text-sm text-gray-500">불러오는 중…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : logs.length === 0 ? (
          <div className="text-sm text-gray-500">기록이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">대여자(사번)</th>
                  <th className="py-2 pr-2">책 제목</th>
                  <th className="py-2 pr-2">대여일</th>
                  <th className="py-2 pr-2">반납일</th>
                  <th className="py-2">반납 예정일</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((r) => {
                  const employeeId = r.employeeId || r.empId || r.userId || "-";
                  const title = r.title || r.bookTitle || r.book?.title || "-";
                  const rentedAt = r.rentedAt || r.rentDate || r.createdAt || null;
                  const returnedAt = r.returnedAt || r.returnDate || null;
                  const due = r.dueDate || r.expectedReturnDate || null;
                  return (
                    <tr key={r.id} className="border-b last:border-none">
                      <td className="py-2 pr-2 whitespace-nowrap">{employeeId}</td>
                      <td className="py-2 pr-2">{title}</td>
                      <td className="py-2 pr-2 whitespace-nowrap">{fmt(rentedAt)}</td>
                      <td className="py-2 pr-2 whitespace-nowrap">
                        {returnedAt ? fmt(returnedAt) : "-"}
                      </td>
                      <td className="py-2 whitespace-nowrap">{due ? fmt(due) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="text-xs text-gray-500">
        * `rentLogs` 컬렉션에서 `rentedAt` 내림차순으로 최대 200건을 불러옵니다.
      </footer>
    </div>
  );
}
