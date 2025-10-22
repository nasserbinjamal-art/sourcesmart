/* SmartBooleanGenerator.jsx — updated (adds Smart JD Parser tab)
   Make sure src/components/SmartJDParser.jsx exists (file provided below)
*/
"use client";
import React, { useEffect, useMemo, useState } from "react";
import IntroOverlay from "./IntroOverlay";
import SmartWebSearch from "./SmartWebSearch";
import SmartJDParser from "./SmartJDParser";

/* Platform configs (kept simple & readable) */
const PLATFORMS = {
  linkedin: { label: "LinkedIn", site: '(site:linkedin.com/in OR site:linkedin.com/pub) -intitle:"profiles" -inurl:"dir/"' },
  github: { label: "GitHub", site: 'site:github.com ("repositories" OR "profile" OR "users") -"jobs" -"hiring"' },
  stackoverflow: { label: "StackOverflow", site: 'site:stackoverflow.com/users ("developer" OR "engineer") -"jobs"' },
  dribbble: { label: "Dribbble", site: 'site:dribbble.com ("UI" OR "UX" OR "Designer") -"jobs" -"hiring"' },
  angellist: { label: "AngelList / Wellfound", site: 'site:angel.co/u OR site:wellfound.com/u' },
  kaggle: { label: "Kaggle", site: 'site:kaggle.com ("notebooks" OR "competitions" OR "profile")' },
};

/* UTIL helpers */
const splitCSV = (s) => (s ? s.split(",").map(x => x.trim()).filter(Boolean) : []);
const quoteIfNeeded = (t) => (/\s/.test(t) ? `"${t}"` : t);
const looksLikeBoolean = (s) => /[\(\)\"']|(?:\bAND\b|\bOR\b|\bNOT\b)/i.test(s || "");

/* Build per-platform query (same approach as before) */
function buildProfileQuery({ title, skills, excludeTerms, locations, platformKey }) {
  const cfg = PLATFORMS[platformKey] || PLATFORMS.linkedin;
  const titleArr = splitCSV(title || "");
  const titleClause = titleArr.length === 0 ? "" : titleArr.length === 1 ? quoteIfNeeded(titleArr[0]) : `(${titleArr.map(quoteIfNeeded).join(" OR ")})`;

  const skillsRaw = (skills || "").trim();
  const skillsClause = skillsRaw ? (looksLikeBoolean(skillsRaw) ? skillsRaw : `(${splitCSV(skillsRaw).map(quoteIfNeeded).join(" OR ")})`) : "";

  const exclRaw = (excludeTerms || "").trim();
  const excludeClause = exclRaw ? splitCSV(exclRaw).map(t => ` -${t}`).join("") : "";

  const locArr = splitCSV(locations || "");
  const locClause = locArr.length === 0 ? "" : locArr.length === 1 ? quoteIfNeeded(locArr[0]) : `(${locArr.map(quoteIfNeeded).join(" OR ")})`;

  const parts = [titleClause, skillsClause, locClause].filter(Boolean);
  const core = parts.join(" AND ");
  return `${core ? core + " " : ""}${cfg.site}${excludeClause}`.replace(/\s+/g, " ").trim();
}

function buildWebQuery({ title, skills, excludeTerms, locations }) {
  const titleArr = splitCSV(title || "");
  const titleClause = titleArr.length === 0 ? "" : titleArr.length === 1 ? quoteIfNeeded(titleArr[0]) : `(${titleArr.map(quoteIfNeeded).join(" OR ")})`;
  const skillsRaw = (skills || "").trim();
  const skillsClause = skillsRaw ? (looksLikeBoolean(skillsRaw) ? skillsRaw : `(${splitCSV(skillsRaw).map(quoteIfNeeded).join(" OR ")})`) : "";
  const exclRaw = (excludeTerms || "").trim();
  const excludeClause = exclRaw ? splitCSV(exclRaw).map(t => ` -${t}`).join("") : "";
  const locArr = splitCSV(locations || "");
  const locClause = locArr.length === 0 ? "" : locArr.length === 1 ? quoteIfNeeded(locArr[0]) : `(${locArr.map(quoteIfNeeded).join(" OR ")})`;

  const baseResume = `(inurl:resume OR intitle:resume OR "resume.pdf" OR "cv.pdf") (filetype:pdf OR filetype:doc OR filetype:docx OR filetype:txt) -job -jobs -template -sample -apply`;
  const core = [titleClause, skillsClause, locClause].filter(Boolean).join(" AND ");
  return `${core ? core + " " : ""}${baseResume}${excludeClause}`.replace(/\s+/g, " ").trim();
}

/* UI helpers */
function CenterToast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto bg-black/90 text-white px-6 py-3 rounded-2xl shadow-xl text-lg font-semibold animate-popIn">
        {message}
      </div>
    </div>
  );
}

function EngineModal({ open, onClose, onChoose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-6 w-full max-w-md text-center shadow-2xl">
        <h3 className="text-lg font-semibold mb-2 text-white">Choose where to run your search</h3>
        <p className="text-sm text-slate-300 mb-4">Open the generated query in a new tab using Google or Bing</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => onChoose("google")} className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:brightness-110">🔍 Google</button>
          <button onClick={() => onChoose("bing")} className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:brightness-110">🟦 Bing</button>
        </div>
        <button onClick={onClose} className="mt-4 text-xs text-slate-300 underline">Cancel</button>
      </div>
    </div>
  );
}

/* Top logo (keeps the same look) */
function TopLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-xl">
        <div className="text-white font-bold text-lg">S</div>
      </div>
      <div>
        <div className="text-white text-lg font-semibold">SourceSmart</div>
        <div className="text-slate-200 text-xs">Smart Recruiting Assistant</div>
      </div>
    </div>
  );
}

/* MAIN COMPONENT */
export default function SmartBooleanGenerator() {
  const [tab, setTab] = useState("xray"); // xray | web | jd
  const [platform, setPlatform] = useState("linkedin");
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [excludeTerms, setExcludeTerms] = useState("");
  const [locations, setLocations] = useState("");
  const [engineModalOpen, setEngineModalOpen] = useState(false);
  const [centerToastMessage, setCenterToastMessage] = useState("");
  const [introOpen, setIntroOpen] = useState(true);

  // generated string depends on tab
  const generated = useMemo(() => {
    if (tab === "web") {
      return buildWebQuery({ title: jobTitle, skills, excludeTerms, locations });
    } else if (tab === "jd") {
      // when JD tab active we let the JD parser handle its own generation; but keep preview here as well
      return ""; // JDParser will show its own outputs
    }
    return buildProfileQuery({ title: jobTitle, skills, excludeTerms, locations, platformKey: platform });
  }, [tab, jobTitle, skills, excludeTerms, locations, platform]);

  /* actions */
  function copyQuery() {
    if (!generated) {
      setCenterToastMessage("Nothing in preview — try JD Parser or fill fields.");
      setTimeout(() => setCenterToastMessage(""), 1500);
      return;
    }
    navigator.clipboard.writeText(generated);
    setCenterToastMessage("✅ Copied! Ready to source like a pro.");
    setTimeout(() => setCenterToastMessage(""), 1600);
  }

  function openSearchPopup() {
    if (!generated) {
      setCenterToastMessage("Generate a query first (title/skills/location).");
      setTimeout(() => setCenterToastMessage(""), 1500);
      return;
    }
    setEngineModalOpen(true);
  }

  function chooseEngine(engine) {
    setEngineModalOpen(false);
    const enc = encodeURIComponent(generated);
    const url = engine === "google" ? `https://www.google.com/search?q=${enc}` : `https://www.bing.com/search?q=${enc}`;
    window.open(url, "_blank");
  }

  const platformsBar = (
    <div className="mb-4">
      <div className="text-xs text-slate-200 mb-2">Platform</div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(PLATFORMS).map(k => {
          const cfg = PLATFORMS[k];
          const active = k === platform;
          return (
            <button key={k} onClick={() => { setPlatform(k); setTab("xray"); }} className={`px-3 py-1 rounded-md text-sm font-medium ${active ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow" : "bg-white/10 text-white"}`}>
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-800 p-6">
      {introOpen && <IntroOverlay onClose={() => setIntroOpen(false)} />}

      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <TopLogo />
          <div className="flex items-center gap-3">
            <button onClick={() => { setTab("xray"); setIntroOpen(false); }} className={`px-3 py-1 rounded ${tab === "xray" ? "bg-white text-black" : "bg-white/10 text-white"}`}>💼 Smart X-Ray</button>
            <button onClick={() => { setTab("web"); setIntroOpen(false); }} className={`px-3 py-1 rounded ${tab === "web" ? "bg-white text-black" : "bg-white/10 text-white"}`}>🌐 Smart Web</button>
            <button onClick={() => { setTab("jd"); setIntroOpen(false); }} className={`px-3 py-1 rounded ${tab === "jd" ? "bg-white text-black" : "bg-white/10 text-white"}`}>🧠 Smart JD Parser</button>
          </div>
        </header>

        <div className="bg-white/5 border border-white/6 rounded-2xl p-6 backdrop-blur-md text-white shadow-lg">
          {/* Platform buttons shown only in xray tab */}
          {tab === "xray" ? platformsBar : <div className="text-xs text-slate-300 mb-4">{tab === "web" ? "Smart Web Search — resume & web results" : "Paste JD in the Smart JD Parser tab to auto-generate queries"}</div>}

          {/* Inputs */}
          {tab !== "jd" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-200">Job Title</label>
                  <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Data Engineer" className="w-full rounded p-3 mt-1 bg-white text-black placeholder:text-slate-400 border border-white/10" />
                  <div className="text-xs text-slate-300 mt-1">e.g. Developer, Engineer, Analyst</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-200">Actions</div>
                  <div className="mt-1 flex gap-2">
                    <button onClick={copyQuery} className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700">Copy Query</button>
                    <button onClick={openSearchPopup} className="px-4 py-2 bg-emerald-500 rounded text-white hover:bg-emerald-600">Search Now</button>
                  </div>
                  <div className="text-xs text-slate-300 mt-2">Tip: Copy to clipboard or run your query directly</div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-200">Skills</label>
                <div className="flex items-start gap-3 mt-1">
                  <input value={skills} onChange={e => setSkills(e.target.value)} placeholder='e.g. ("python" OR "sql") or python, sql' className="w-full rounded p-3 bg-white text-black placeholder:text-slate-400 border border-white/10" />
                  <div className="text-xs text-slate-300 mt-2">Use commas or Boolean (AND / OR / NOT)</div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-200">Exclude Terms (optional)</label>
                <input value={excludeTerms} onChange={e => setExcludeTerms(e.target.value)} placeholder="e.g. intern, junior" className="w-full rounded p-3 mt-1 bg-white text-black placeholder:text-slate-400 border border-white/10" />
                <div className="text-xs text-slate-300 mt-1">Exclude unwanted results (comma-separated)</div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-200">Locations</label>
                  <input value={locations} onChange={e => setLocations(e.target.value)} placeholder="e.g. Hyderabad, Bangalore, India" className="w-full rounded p-3 mt-1 bg-white text-black placeholder:text-slate-400 border border-white/10" />
                  <div className="text-xs text-slate-300 mt-1">Tip: Search multiple locations using commas.</div>
                </div>
                <div />
              </div>

              <div className="mt-6">
                <label className="text-xs font-semibold text-slate-200">Generated Query</label>
                <pre className="whitespace-pre-wrap bg-white/90 text-black rounded p-3 mt-2 font-mono text-sm break-words">{generated || "No query yet — start typing title/skills/location."}</pre>
              </div>
            </>
          )}

          {/* If JD tab, show parser component */}
          {tab === "jd" && (
            <div className="mt-2">
              <SmartJDParser
                onOpenEngine={(engine, q) => {
                  const enc = encodeURIComponent(q);
                  const url = engine === "google" ? `https://www.google.com/search?q=${enc}` : `https://www.bing.com/search?q=${enc}`;
                  window.open(url, "_blank");
                }}
                onCopy={(q) => {
                  navigator.clipboard.writeText(q);
                  setCenterToastMessage("✅ Copied! Ready to source like a pro.");
                  setTimeout(() => setCenterToastMessage(""), 1600);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* modal & center toast */}
      <EngineModal open={engineModalOpen} onClose={() => setEngineModalOpen(false)} onChoose={chooseEngine} />
      {centerToastMessage ? <CenterToast message={centerToastMessage} /> : null}

      <style>{`
        @keyframes popIn { from { transform: translateY(8px) scale(.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity:1 } }
        .animate-popIn { animation: popIn 240ms ease-out; }
      `}</style>
    </div>
  );
}
