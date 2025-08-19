import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <div className="text-xs text-gray-300">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState({ total: 0, renting: 0, available: 0, dueSoon: 0 });

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "books"));
      let total = 0, renting = 0, available = 0, dueSoon = 0;
      const now = new Date(); const soon = new Date(now); soon.setDate(now.getDate() + 3);
      snap.forEach(d => {
        total += 1;
        const b = d.data();
        const status = b.status || (b.isAvailable === false ? "대출중" : "대출가능");
        if (status === "대출중") renting += 1; else available += 1;
        const due = b.dueDate || b.dueAt || b.due || null;
        if (due) {
          const dt = due.toDate ? due.toDate() : new Date(due);
          if (dt >= now && dt <= soon) dueSoon += 1;
        }
      });
      setStats({ total, renting, available, dueSoon });
    })().catch(console.error);
  }, []);

  const cards = useMemo(() => [
    { title: "도서목록", desc: "제목, 별점, 대출상태를 한눈에", icon: "📌" },
    { title: "대여하기",  desc: "바코드 스캔으로 즉시 대여",   icon: "⚡"  },
    { title: "반납하기",  desc: "사번 인증 + 별점 남기기",     icon: "⭐"  },
  ], []);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 shadow">
        <h1 className="text-xl font-bold">안녕하세요 👋</h1>
        <p className="mt-1 text-sm text-gray-200">북허브 메인에서 필요한 작업을 빠르게 시작하세요.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <Stat label="총 도서" value={stats.total} />
          <Stat label="대출 중" value={stats.renting} />
          <Stat label="대출 가능" value={stats.available} />
          <Stat label="반납 임박(3일)" value={stats.dueSoon} />
        </div>
      </section>
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cards.map((c) => (
            <div key={c.title} className="group text-left rounded-2xl bg-white border border-gray-200 p-4 hover:shadow-md transition shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl p-2 bg-gray-100 text-gray-800">{c.icon}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{c.title}</div>
                    <div className="text-xs text-gray-500">{c.desc}</div>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:translate-x-0.5 transition">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
