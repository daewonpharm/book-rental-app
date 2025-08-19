import React from "react";
import { getSafeFirebaseConfig } from "../firebase";

export default function EnvDebug(){
  const cfg = getSafeFirebaseConfig();
  return (
    <div style={{padding:16, fontFamily:"ui-sans-serif, system-ui"}}>
      <h1 style={{fontWeight:700}}>환경 변수 진단 (/__env)</h1>
      <p style={{color:"#555"}}>Vercel이 주입한 VITE_FB_* 값을 마스킹해 보여줍니다.</p>
      <pre style={{background:"#f6f8fa", padding:12, borderRadius:8}}>
{JSON.stringify(cfg, null, 2)}
      </pre>
      <p style={{marginTop:8, color:"#444"}}>
        <b>VITE_FB_PROJECT_ID</b>가 Firestore 콘솔의 프로젝트 ID(예: <code>dw-book-rental</code>)와 같아야 해요.
      </p>
    </div>
  );
}
