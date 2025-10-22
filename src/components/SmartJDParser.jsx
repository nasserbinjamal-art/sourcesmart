/* SmartJDParser.jsx — JD Parser (rule-based now, pluggable AI hook later) */
import React, { useMemo, useState } from "react";

/*
  Behavior:
  - Paste JD text
  - "Analyze JD" creates structured fields:
    -> Titles (array), Skills (array), Locations (array), Seniority (string)
  - Outputs:
    -> Boolean string
    -> X-ray query for Google (resume/web) + platform recommendations
  - Pluggable hook: add `useAI` boolean or call structure to integrate OpenAI later
*/

const COMMON_SENIORITY = [
  { tag: "intern", labels: ["intern", "internship"] },
  { tag: "junior", labels: ["junior", "jr", "entry-level", "entry level"] },
  { tag: "mid", labels: ["mid", "associate", "2+ years", "3+ years"] },
  { tag: "senior", labels: ["senior", "lead", "principal", "5+ years", "7+ years"] },
];

const splitCSV = (s) => (s ? s.split(",").map(x => x.trim()).filter(Boolean) : []);
const quoteIfNeeded = (t) => (/\s/.test(t) ? `"${t}"` : t);

/* Very small heuristic parser to extract fields from JD text */
function heuristicParse(text) {
  const out = { titles: [], skills: [], locations: [], seniority: "" };
  if (!text || !text.trim()) return out;

  const lower = text.toLowerCase();

  // extract lines, look for typical headings
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // title guess: first non-empty line, or "Title:" pattern
  const firstLine = lines[0] || "";
  const titleMatch = text.match(/title[:\-]\s*(.+)/i);
  if (titleMatch) {
    out.titles = splitCSV(titleMatch[1]);
  } else if (firstLine && firstLine.length < 80) {
    // try to ignore long paragraphs
    out.titles = [firstLine];
  }

  // skills: look for lines containing 'skill' or 'requirements' or 'technologies' or common separators
  const skillsCandidates = [];
  lines.forEach(l => {
    if (/skills?:/i.test(l) || /requirements?/i.test(l) || /technolog/i.test(l) || /stack:/i.test(l)) {
      // remove heading and split
      const after = l.replace(/^[\s\S]*?:/i, "");
      splitCSV(after.replace(/•/g, ",")).forEach(s => skillsCandidates.push(s));
    } else {
      // also check for common tech tokens in the line
      if (/(javascript|python|java|react|node|sql|aws|docker|kubernetes|django|flask|scala|ruby|php|go|c\+\+|c#)/i.test(l)) {
        splitCSV(l.replace(/•/g, ",")).forEach(s => {
          // add small tokens
          skillsCandidates.push(s);
        });
      }
    }
  });

  // dedupe and clean simple punctuation
  out.skills = Array.from(new Set(skillsCandidates.map(s => s.replace(/[\(\)\[\]\.]/g, "").trim()).filter(Boolean))).slice(0, 40);

  // locations: look for 'Location:' or city names (simple)
  const locMatch = text.match(/location[:\-]\s*([^\n\r]+)/i);
  if (locMatch) {
    out.locations = splitCSV(locMatch[1]);
  } else {
    // crude detect common country/city names present in text
    const cities = ["hyderabad","bengaluru","bangalore","mumbai","chennai","delhi","new york","london","berlin","san francisco","seattle","boston","toronto"];
    cities.forEach(c => {
      if (lower.includes(c)) out.locations.push(c);
    });
    out.locations = Array.from(new Set(out.locations));
  }

  // seniority: check for tokens
  for (const s of COMMON_SENIORITY) {
    for (const label of s.labels) {
      if (lower.includes(label)) {
        out.seniority = s.tag;
        break;
      }
    }
    if (out.seniority) break;
  }

  return out;
}

/* Build boolean and x-ray outputs */
function buildBooleanFromParsed(parsed) {
  const titleClause = parsed.titles.length ? (parsed.titles.length === 1 ? quoteIfNeeded(parsed.titles[0]) : `(${parsed.titles.map(quoteIfNeeded).join(" OR ")})`) : "";
  const skillsClause = parsed.skills.length ? (parsed.skills.length === 1 ? quoteIfNeeded(parsed.skills[0]) : `(${parsed.skills.map(quoteIfNeeded).join(" OR ")})`) : "";
  const locClause = parsed.locations.length ? (parsed.locations.length === 1 ? quoteIfNeeded(parsed.locations[0]) : `(${parsed.locations.map(quoteIfNeeded).join(" OR ")})`) : "";

  const parts = [titleClause, skillsClause].filter(Boolean);
  let core = parts.join(" AND ");
  if (!core && locClause) core = locClause;
  else if (core && locClause) core = `${core} AND ${locClause}`;

  return core.trim();
}

function buildXrayFromParsed(parsed, platformFilter = "") {
  const core = buildBooleanFromParsed(parsed);
  const site = platformFilter ? platformFilter : "";
  return `${core} ${site}`.replace(/\s+/g, " ").trim();
}

/* Component */
export default function SmartJDParser({ onOpenEngine, onCopy }) {
  const [jdText, setJdText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [suggestedPlatforms, setSuggestedPlatforms] = useState([]);

  function analyzeJD() {
    const p = heuristicParse(jdText);
    setParsed(p);

    // quick platform suggestions (simple rules)
    const suggestions = [];
    if (p.skills.some(s => /javascript|react|node|webpack|typescript|vue|angular/i.test(s))) suggestions.push("github", "linkedin");
    if (p.skills.some(s => /ui|ux|figma|adobe|illustrator|photoshop|dribbble/i.test(s))) suggestions.push("dribbble", "linkedin");
    if (p.skills.some(s => /data science|pandas|numpy|scikit|kaggle|notebook/i.test(s))) suggestions.push("kaggle", "github", "linkedin");
    if (p.seniority === "senior") suggestions.push("linkedin");
    setSuggestedPlatforms(Array.from(new Set(suggestions)));
  }

  // derived outputs
  const booleanString = useMemo(() => (parsed ? buildBooleanFromParsed(parsed) : ""), [parsed]);
  const xrayLinkedIn = useMemo(() => (parsed ? buildXrayFromParsed(parsed, '(site:linkedin.com/in OR site:linkedin.com/pub) -intitle:"profiles" -inurl:"dir/"') : ""), [parsed]);
  const xrayWebResume = useMemo(() => (parsed ? buildXrayFromParsed(parsed, '(inurl:resume OR intitle:resume) (filetype:pdf OR filetype:doc OR filetype:docx) -job -jobs -template') : ""), [parsed]);

  return (
    <div className="bg-white/5 border border-white/6 backdrop-blur-md rounded-2xl p-6 text-white shadow-lg">
      <div className="mb-4">
        <div className="text-lg font-semibold">Smart JD Parser</div>
        <div className="text-sm text-slate-300">Paste a Job Description and auto-generate Boolean & X-ray queries.</div>
      </div>

      <div className="mb-3">
        <textarea value={jdText} onChange={e => setJdText(e.target.value)} rows={8} placeholder="Paste your Job Description here..." className="w-full rounded p-3 bg-white text-black placeholder:text-slate-400 border border-white/10" />
      </div>

      <div className="flex gap-3 mb-4">
        <button onClick={analyzeJD} className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700">Analyze JD</button>
        <button onClick={() => { setJdText(""); setParsed(null); setSuggestedPlatforms([]); }} className="px-4 py-2 bg-gray-700 rounded text-white">Clear</button>
      </div>

      {parsed && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-white/10 p-3 rounded">
              <div className="text-xs text-slate-200 font-semibold mb-1">Titles</div>
              <div className="text-sm text-white">{parsed.titles.length ? parsed.titles.join(", ") : "—"}</div>
            </div>
            <div className="bg-white/10 p-3 rounded">
              <div className="text-xs text-slate-200 font-semibold mb-1">Skills</div>
              <div className="text-sm text-white">{parsed.skills.length ? parsed.skills.join(", ") : "—"}</div>
            </div>
            <div className="bg-white/10 p-3 rounded">
              <div className="text-xs text-slate-200 font-semibold mb-1">Locations</div>
              <div className="text-sm text-white">{parsed.locations.length ? parsed.locations.join(", ") : "—"}</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-200 font-semibold">Boolean String</div>
            <div className="flex gap-2 items-start mt-2">
              <pre className="whitespace-pre-wrap bg-white/90 text-black rounded p-3 font-mono text-sm flex-1">{booleanString || "—"}</pre>
              <div className="flex flex-col gap-2">
                <button onClick={() => { navigator.clipboard.writeText(booleanString); onCopy && onCopy(booleanString); }} className="px-3 py-2 bg-indigo-600 rounded text-white">Copy</button>
                <button onClick={() => onOpenEngine && onOpenEngine("google", booleanString)} className="px-3 py-2 bg-sky-500 rounded text-white">Open (Google)</button>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-200 font-semibold">X-ray — LinkedIn</div>
            <div className="flex gap-2 items-start mt-2">
              <pre className="whitespace-pre-wrap bg-white/90 text-black rounded p-3 font-mono text-sm flex-1">{xrayLinkedIn || "—"}</pre>
              <div className="flex flex-col gap-2">
                <button onClick={() => { navigator.clipboard.writeText(xrayLinkedIn); onCopy && onCopy(xrayLinkedIn); }} className="px-3 py-2 bg-indigo-600 rounded text-white">Copy</button>
                <button onClick={() => onOpenEngine && onOpenEngine("google", xrayLinkedIn)} className="px-3 py-2 bg-sky-500 rounded text-white">Open (Google)</button>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-200 font-semibold">X-ray — Web / Resumes</div>
            <div className="flex gap-2 items-start mt-2">
              <pre className="whitespace-pre-wrap bg-white/90 text-black rounded p-3 font-mono text-sm flex-1">{xrayWebResume || "—"}</pre>
              <div className="flex flex-col gap-2">
                <button onClick={() => { navigator.clipboard.writeText(xrayWebResume); onCopy && onCopy(xrayWebResume); }} className="px-3 py-2 bg-indigo-600 rounded text-white">Copy</button>
                <button onClick={() => onOpenEngine && onOpenEngine("google", xrayWebResume)} className="px-3 py-2 bg-sky-500 rounded text-white">Open (Google)</button>
              </div>
            </div>
          </div>

          <div className="mb-2">
            <div className="text-xs text-slate-200 font-semibold">Suggested Platforms</div>
            <div className="mt-2 flex gap-2">
              {suggestedPlatforms.length ? suggestedPlatforms.map(p => (
                <div key={p} className="px-3 py-1 bg-white/10 rounded text-sm">{p}</div>
              )) : <div className="text-sm text-slate-300">No suggestions — try adding skills/technologies in the JD.</div>}
            </div>
          </div>
        </>
      )}

      <div className="text-xs text-slate-400 mt-4">Note: This parser uses lightweight heuristics locally. For advanced AI-powered parsing, we can plug in OpenAI / Claude / Gemini to extract more precise fields and context.</div>
    </div>
  );
}
