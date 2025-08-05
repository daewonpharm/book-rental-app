const admin = require("firebase-admin");
const path = require("path");

// 🔑 서비스 계정 키 파일 경로 설정
const serviceAccount = require("./serviceAccountKey.json"); // 이 파일은 다음 단계에서 설명

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateMissingTimestamps() {
  const booksRef = db.collection("books");
  const snapshot = await booksRef.get();

  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    const updates = {};

    if (!("rentedAt" in data)) updates.rentedAt = null;
    if (!("returnedAt" in data)) updates.returnedAt = null;

    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
      count++;
      console.log(`✅ [${doc.id}] 누락 필드 추가됨`);
    }
  }

  console.log(`총 ${count}개의 문서가 수정되었습니다.`);
}

updateMissingTimestamps().catch(console.error);
