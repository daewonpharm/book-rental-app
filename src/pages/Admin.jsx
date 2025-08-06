// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { format } from "date-fns";

export default function Admin() {
  const [books, setBooks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [input, setInput] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const correctPassword = "70687068"; // ✅ 원하는 비밀번호 설정

  // 🔐 비밀번호 확인 후 인증
  const handleAccess = () => {
    if (input === correctPassword) {
      setAuthorized(true);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  // 🔒 비밀번호 인증 UI
  if (!authorized) {
    return (
      <div className="space-y-4 max-w-sm mx-auto mt-10">
        <h2 className="text-xl font-bold text-center">🔒 관리자 페이지</h2>
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          onClick={handleAccess}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          접속하기
        </button>
      </div>
    );
  }

  // ✅ 인증 성공 시 관리자 페이지 표시
  const fetchBooks = async () => {
    const booksRef = collection(db, "books");
    const snapshot = await getDocs(booksRef);
    const bookData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setBooks(bookData);
  };

  const fetchLogs = async () => {
    const logsRef = collection(db, "rentLogs");
    const q = query(logsRef, orderBy("rentedAt", "desc"));
    const snapshot = await getDocs(q);
    const logData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLogs(logData);
  };

  const handleDateMigration = async () => {
    const booksRef = collection(db, "books");
    const snapshot = await getDocs(booksRef);

    const updates = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const updates = {};

      if (data.rentDate && !data.rentedAt) {
        updates.rentedAt = Timestamp.fromDate(new Date(data.rentDate));
      }
      if (data.returnDate && !data.returnedAt) {
        updates.returnedAt = Timestamp.fromDate(new Date(data.returnDate));
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "books", docSnap.id), updates);
      }
    });

    await Promise.all(updates);
    alert("📆 날짜 필드 변환 완료!");
    fetchBooks();
  };

  const formatDate = (timestamp) =>
    timestamp?.toDate ? format(timestamp.toDate(), "yyyy.MM.dd") : "–";

  useEffect(() => {
    fetchBooks();
    fetchLogs();
  }, []);

  const topBooks = Object.entries(
    logs.reduce((acc, log) => {
      acc[log.title] = (acc[log.title] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topUsers = Object.entries(
    logs.reduce((acc, log) => {
      acc[log.rentedBy] = (acc[log.rentedBy] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🛠 관리자 페이지</h2>

      <button
        onClick={handleDateMigration}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-6"
      >
        📆 rentDate/returnDate ➜ Timestamp로 변환
      </button>

      {/* ✅ 누적 대여 기록 테이블 */}
      <div className="overflow-x-auto mb-12">
        <h3 className="text-lg font-semibold mb-2">📜 누적 대여 기록</h3>
        <table className="table-auto w-full border-collapse border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">👤 대여자</th>
              <th className="border px-4 py-2">📘 책 제목</th>
              <th className="border px-4 py-2">📅 대여일</th>
              <th className="border px-4 py-2">📅 반납일</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="border px-4 py-2">{log.rentedBy}</td>
                <td className="border px-4 py-2">{log.title}</td>
                <td className="border px-4 py-2">{formatDate(log.rentedAt)}</td>
                <td className="border px-4 py-2">
                  {log.returnedAt ? formatDate(log.returnedAt) : "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔝 가장 인기 있는 책 Top 5 */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-2">📚 가장 인기 있는 책 Top 5</h3>
        <ul className="list-disc pl-5 text-sm">
          {topBooks.map(([title, count], i) => (
            <li key={i}>
              <strong>{title}</strong> - {count}회 대여
            </li>
          ))}
        </ul>
      </div>

      {/* 👤 가장 많이 빌린 사람 Top 5 */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-2">👤 대여를 가장 많이 한 사번 Top 5</h3>
        <ul className="list-disc pl-5 text-sm">
          {topUsers.map(([user, count], i) => (
            <li key={i}>
              <strong>{user}</strong> - {count}회 대여
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
