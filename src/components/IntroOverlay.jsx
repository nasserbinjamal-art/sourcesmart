/* IntroOverlay.jsx — small overlay with rotating taglines */
import React, { useEffect, useState } from "react";

export default function IntroOverlay({ onClose }) {
  const taglines = [
    "Find hidden talent with Smart Sourcing.",
    "Start sourcing smarter with SourceSmart.",
    "Discover candidates beyond job boards.",
    "Recruit better. Faster. Smarter.",
  ];
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((s) => (s + 1) % taglines.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div className="relative z-10 max-w-3xl mx-auto text-center p-8 rounded-2xl bg-white/6 border border-white/8 backdrop-blur-md animate-popIn">
        <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-xl flex items-center justify-center mb-4">
          <div className="text-white text-2xl font-bold">S</div>
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">Find hidden talent with Smart Sourcing</h1>
        <p className="text-slate-200 mb-4">{taglines[i]}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold hover:brightness-105">Launch Smart X-Ray Search 🚀</button>
        </div>
        <div className="text-xs text-slate-300 mt-4">Tip: You can switch to Smart Web Search from the top-right anytime.</div>
      </div>
    </div>
  );
}
