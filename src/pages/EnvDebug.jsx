// src/pages/EnvDebug.jsx
import React from "react";

export default function EnvDebug() {
  const env = {
    VITE_FB_API_KEY:            import.meta.env.VITE_FB_API_KEY,
    VITE_FB_AUTH_DOMAIN:        import.meta.env.VITE_FB_AUTH_DOMAIN,
    VITE_FB_PROJECT_ID:         import.meta.env.VITE_FB_PROJECT_ID,
    VITE_FB_STORAGE_BUCKET:     import.meta.env.VITE_FB_STORAGE_BUCKET,
    VITE_FB_MESSAGING_SENDER_ID:import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
    VITE_FB_APP_ID:             import.meta.env.VITE_FB_APP_ID,
  };
  const mask = (v) => !v ? "" : (String(v).length > 8 ? `${v.slice(0,4)}…${v.slice(-3)}` : v);

  return (
    <div style={{padding:16, fontFamily:"ui-sans-serif, system-ui"}}>
      <h1 style={{fontWeight:700}}>환경 변수 진단 (/__env)</h1>
      <pre style={{background:"#f6f8fa", padding:12, borderRadius:8}}>
{JSON.stringify(Object.fromEntries(Object.entries(env).map(([k,v])=>[k,mask(String(v||""))])), null, 2)}
      </pre>
      <p style={{marginTop:8}}>프로젝트 ID(<code>VITE_FB_PROJECT_ID</code>)가 Firestore 콘솔의 ID와 동일해야 합니다.</p>
    </div>
  );
}
