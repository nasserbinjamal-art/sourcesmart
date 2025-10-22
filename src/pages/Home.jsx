import React from 'react'
export default function Home({ onNavigate }){
  return (
    <section className="py-10">
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold mb-2">Welcome to SourceSmart.ai</h1>
        <p className="text-gray-600 mb-4">Your Recruiter’s Boolean Assistant — generate precise X-ray and Boolean search strings in seconds.</p>
        <div className="flex gap-3">
          <button onClick={()=>onNavigate('builder')} className="px-4 py-2 rounded bg-accent text-white">Start Building</button>
          <button onClick={()=>onNavigate('about')} className="px-4 py-2 rounded border">Learn More</button>
        </div>
      </div>
    </section>
  )
}
