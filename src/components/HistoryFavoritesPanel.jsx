import React, { useState, useEffect } from 'react'
export default function HistoryFavoritesPanel(){
  const [history, setHistory] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('ss_history')||'[]') }catch(e){ return [] }
  })
  useEffect(()=>{ localStorage.setItem('ss_history', JSON.stringify(history)) }, [history])
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md mt-4">
      <h3 className="font-semibold mb-2">Saved</h3>
      {history.length===0 ? <div className="text-sm text-gray-500">No saved queries yet</div> : history.map((q,i)=>(
        <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded mb-2">
          <div className="text-xs font-mono">{q}</div>
          <div className="flex gap-2">
            <button onClick={()=>navigator.clipboard.writeText(q)} className="text-sm">Copy</button>
            <button onClick={()=>setHistory(history.filter((_,idx)=>idx!==i))} className="text-sm">Delete</button>
          </div>
        </div>
      ))}
      <div className="mt-2">
        <button onClick={()=>{ const q=prompt('Save a query'); if(q){ setHistory([q,...history]) } }} className="px-3 py-2 border rounded">Save Query</button>
      </div>
    </div>
  )
}
