import React from 'react'
export default function TemplatePanel({ onSelect }){
  const templates = [
    { title:'Backend Developer', generated: '"Node.js" OR "Python" AND "PostgreSQL" AND "Remote"' },
    { title:'Frontend React', generated: '"React" OR "TypeScript" AND "CSS" AND "Remote"' },
    { title:'LLM Engineer', generated: '"Python" OR "PyTorch" AND "Vector DB" AND "Remote"' }
  ]
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <h3 className="font-semibold mb-2">Templates</h3>
      <div className="flex gap-2">
        {templates.map(t=> <button key={t.title} onClick={()=>onSelect(t)} className="px-3 py-2 border rounded">{t.title}</button>)}
      </div>
    </div>
  )
}
