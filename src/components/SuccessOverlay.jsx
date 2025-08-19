import React from "react";
export default function SuccessOverlay({ mode, title, desc, onClose }) {
  const animClass = mode === "rent" ? "anim-in" : "anim-out";
  return (
    <div className="overlay-root" role="dialog" aria-modal="true">
      <div className="overlay-card">
        <div className={`book-badge ${animClass}`} aria-hidden>📚</div>
        <div className="overlay-title">{title}</div>
        {desc && <div className="overlay-desc">{desc}</div>}
        <button className="overlay-cta" onClick={onClose}>확인</button>
      </div>
    </div>
  );
}
