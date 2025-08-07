export default function BookList() {
  // ... useState, useEffect 등 동일 생략 ...

  return (
    <div className="min-h-screen w-full px-4">
      <div className="w-full max-w-[500px] mx-auto space-y-6">
        <h2 className="text-xl font-bold">📚 도서 목록</h2>

        {/* 검색 및 필터 */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="제목 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 w-full"
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

        {/* 도서 목록 테이블 */}
        <div className="w-full overflow-x-auto">
          <table className="w-full table-auto border-collapse border text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border px-4 py-2">제목</th>
                <th className="border px-4 py-2">상태</th>
                <th className="border px-4 py-2">반납 예정일</th>
                <th className="border px-4 py-2">평균 별점</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((book) => (
                <tr key={book.id} className="border-t">
                  <td
                    className="px-4 py-2"
                    onClick={() => {
                      if (book.title === "미키7") handleMickeyClick();
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

        {/* 인기 대여 TOP 5 */}
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-2">🔥 인기 대여 TOP 5</h3>
          <table className="table-auto w-full border-collapse border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">순위</th>
                <th className="border px-4 py-2">제목</th>
                <th className="border px-4 py-2">횟수</th>
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
    </div>
  );
}
