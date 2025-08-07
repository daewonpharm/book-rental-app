return (
  <div className="w-full flex justify-center px-4">
    <div className="w-full max-w-screen-sm space-y-4">
      <h2 className="text-xl font-bold">📥 도서 대여</h2>

      <label className="block text-sm font-semibold">📷 바코드 스캔</label>
      <button
        className="w-full bg-[#fca15f] text-white p-2 rounded hover:bg-[#f98b36] mb-2"
        onClick={() => setScanning(!scanning)}
      >
        {scanning ? "📷 스캔 중지" : "📷 카메라로 스캔하기"}
      </button>

      {scanning && (
        <>
          <BarcodeScanner
            onDetected={handleDetected}
            onClose={() => setScanning(false)}
          />
          <p className="text-sm text-red-500 mt-2">
            ⚠️ iOS에서는 두 번째 스캔부터 전면 카메라가 사용될 수 있어요.
          </p>
        </>
      )}

      <label className="block text-sm font-semibold mt-4">📕 도서 제목</label>
      <input
        type="text"
        placeholder="(스캔 시 자동 표시)"
        value={bookTitle}
        readOnly
        className="border p-2 w-full bg-gray-100 text-gray-800"
      />

      <label className="block text-sm font-semibold mt-4">👤 사번 6자리</label>
      <input
        type="text"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        maxLength={6}
        className="border p-2 w-full"
        placeholder="사번을 입력해주세요"
        inputMode="numeric"
      />

      <button
        onClick={handleRent}
        className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 mt-4"
      >
        대여하기
      </button>
    </div>
  </div>
);
