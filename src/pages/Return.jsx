import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

export default function Return() {
  const [bookCode, setBookCode] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [rating, setRating] = useState(null);
  const [books, setBooks] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      const snapshot = await getDocs(collection(db, "books"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBooks(data);
    };
    fetchBooks();
  }, []);

  const handleBookSelect = async (code) => {
    const found = books.find((b) => b.bookCode === code);
    if (found) {
      setBookCode(code);
      setBookTitle(found.title || "");
    } else {
      alert("해당 코드를 가진 책을 찾을 수 없습니다.");
    }
  };

  const handleSubmit = async () => {
    if (!bookCode || !employeeId || rating === null) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    const q = query(
      collection(db, "rentLogs"),
      where("bookCode", "==", bookCode),
      where("returnedAt", "==", null)
    );
    const snapshot = await getDocs(q);
    const target = snapshot.docs.find((doc) => doc.data().rentedBy === employeeId);

    if (!target) {
      alert("반납 기록을 찾을 수 없습니다.");
      return;
    }

    const logRef = doc(db, "rentLogs", target.id);
    await updateDoc(logRef, {
      returnedAt: new Date(),
      rating: parseFloat(rating),
    });

    const bookRef = doc(db, "books", target.data().bookId);
    const bookSnap = await getDoc(bookRef);
    const bookData = bookSnap.data();
    const newRating =
      bookData.ratingCount && bookData.avgRating
        ? (bookData.avgRating * bookData.ratingCount + parseFloat(rating)) /
          (bookData.ratingCount + 1)
        : parseFloat(rating);

    await updateDoc(bookRef, {
      available: true,
      returnedAt: new Date(),
      avgRating: parseFloat(newRating.toFixed(2)),
      ratingCount: (bookData.ratingCount || 0) + 1,
    });

    setSuccess(true);
    setBookCode("");
    setBookTitle("");
    setEmployeeId("");
    setRating(null);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold mb-4">📘 도서 반납</h2>

      <label className="block mb-2">
        바코드 또는 책 코드 입력
        <input
          type="text"
          value={bookCode}
          onChange={(e) => handleBookSelect(e.target.value)}
          className="border p-2 w-full mt-1"
        />
      </label>

      {bookTitle && (
        <div className="mb-2 text-sm text-gray-600">선택된 책: {bookTitle}</div>
      )}

      <label className="block mb-2">
        사번 6자리
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="border p-2 w-full mt-1"
        />
      </label>

      <div>
        <div className="mb-2 font-semibold">책에 대한 별점을 남겨주세요</div>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(10)].map((_, i) => {
            const value = 5 - i * 0.5;
            return (
              <button
                key={value}
                onClick={() => setRating(value)}
                className={`border p-2 rounded ${
                  rating === value ? "bg-yellow-300" : "bg-white"
                }`}
              >
                ⭐ {value.toFixed(1)}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        반납 완료
      </button>

      {success && (
        <div className="text-green-600 font-semibold text-center mt-4">
          ✅ 반납이 완료되었습니다!
        </div>
      )}
    </div>
  );
}
