import React from 'react'
export default function QueryOutput({ query }){
  if(!query) return null
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md mt-4">
      <h3 className="font-semibold">Generated Query</h3>
      <pre className="bg-gray-50 p-3 rounded mt-2 text-sm font-mono">{query}</pre>
      <div className="mt-3 flex gap-2">
        <button onClick={()=>{ navigator.clipboard.writeText(query); alert('Copied') }} className="px-3 py-2 rounded bg-accent text-white">Copy</button>
        <button onClick={()=>{ const blob=new Blob([query]); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='query.txt'; a.click(); URL.revokeObjectURL(url) }} className="px-3 py-2 border rounded">Download</button>
      </div>
    </div>
  )
}
