/* SmartWebSearch.jsx — Resume / Web Search mode (called from main) */
import React, { useMemo } from "react";

const RESUME_BASE = `(inurl:resume OR intitle:resume OR "resume.pdf" OR "cv.pdf") (filetype:pdf OR filetype:doc OR filetype:docx OR filetype:txt) -job -jobs -template -sample -apply`;

const splitCSV = (s) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);
const quoteIfNeeded = (t) => (/\s/.test(t) ? `"${t}"` : t);
const looksLikeBoolean = (s) => /[\(\)\"']|(?:\bAND\b|\bOR\b|\bNOT\b)/i.test(s || "");

function buildWebQuery({ title, skills, excludeTerms, locations }) {
  const titleArr = splitCSV(title || "");
  const titleClause =
    titleArr.length === 0
      ? ""
      : titleArr.length === 1
      ? quoteIfNeeded(titleArr[0])
      : `(${titleArr.map(quoteIfNeeded).join(" OR ")})`;
  const skillsRaw = (skills || "").trim();
  const skillsClause = skillsRaw
    ? looksLikeBoolean(skillsRaw)
      ? skillsRaw
      : `(${splitCSV(skillsRaw).map(quoteIfNeeded).join(" OR ")})`
    : "";
  const exclRaw = (excludeTerms || "").trim();
  const excludeClause = exclRaw ? splitCSV(exclRaw).map((t) => ` -${t}`).join("") : "";
  const locArr = splitCSV(locations || "");
  const locClause =
    locArr.length === 0
      ? ""
      : locArr.length === 1
      ? quoteIfNeeded(locArr[0])
      : `(${locArr.map(quoteIfNeeded).join(" OR ")})`;
  const core = [titleClause, skillsClause, locClause].filter(Boolean).join(" AND ");
  return `${core ? core + " " : ""}${RESUME_BASE}${excludeClause}`.replace(/\s+/g, " ").trim();
}

export default function SmartWebSearch({ title, skills, excludeTerms, locations, onOpenEngine, onCopy }) {
  const q = useMemo(() => buildWebQuery({ title, skills, excludeTerms, locations }), [title, skills, excludeTerms, locations]);

  return (
    <div className="bg-white/5 border border-white/6 backdrop-blur-md rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-semibold">Smart Web Search</div>
          <div className="text-sm text-slate-300">Resume-focused queries across Google & Bing</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onCopy(q)} className="px-3 py-2 bg-indigo-600 rounded text-white">Copy</button>
          <button onClick={() => onOpenEngine("google")} className="px-3 py-2 bg-sky-500 rounded text-white">Open (Google)</button>
          <button onClick={() => onOpenEngine("bing")} className="px-3 py-2 bg-emerald-500 rounded text-white">Open (Bing)</button>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-200">Generated Resume Query</label>
        <pre className="whitespace-pre-wrap bg-white/90 text-black rounded p-3 mt-2 font-mono text-sm break-words">{q || "No query yet."}</pre>
      </div>
    </div>
  );
}
