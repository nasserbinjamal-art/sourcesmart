import React, { useState, useEffect } from 'react'
export default function Navbar({ onNavigate }){
  const [theme, setTheme] = useState(localStorage.getItem('ss_theme')||'light')
  useEffect(()=>{ document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('ss_theme', theme) }, [theme])
  return (
    <nav className="bg-white dark:bg-[#071028] shadow-sm">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <img src="/docs/logo-placeholder.svg" alt="logo" width="120" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={()=>onNavigate('home')} className="px-3 py-2 rounded hover:bg-gray-100">Home</button>
          <button onClick={()=>onNavigate('builder')} className="px-3 py-2 rounded hover:bg-gray-100">Builder</button>
          <button onClick={()=>onNavigate('about')} className="px-3 py-2 rounded hover:bg-gray-100">About</button>
          <button onClick={()=>setTheme(t=> t==='light' ? 'dark' : 'light')} title="Toggle theme" className="px-3 py-2 rounded border ml-2">{theme==='light' ? '🌙' : '☀️'}</button>
        </div>
      </div>
    </nav>
  )
}
