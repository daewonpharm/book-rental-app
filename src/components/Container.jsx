// src/components/Container.jsx
import React from "react";

export default function Container({ children }) {
  return (
    <div className="min-h-screen flex justify-center items-start bg-white">
      <div className="w-full max-w-sm px-4 py-8">
        {children}
      </div>
    </div>
  );
}
