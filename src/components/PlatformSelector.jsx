import React from 'react'
export default function PlatformSelector({ selected, onSelect }){
  const platforms = ['LinkedIn','GitHub','StackOverflow','Google X-Ray','Indeed']
  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm">
      <div className="flex gap-2">
        {platforms.map(p=> (
          <button key={p} onClick={()=>onSelect(p)} className={`px-3 py-2 rounded-lg text-sm ${selected===p ? 'ring-2 ring-brand bg-brand text-white' : 'border'}`}>
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
