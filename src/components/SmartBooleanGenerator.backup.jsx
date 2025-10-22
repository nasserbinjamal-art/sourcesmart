import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function SmartBooleanGenerator({ platform, onGenerate }){
  const [skills, setSkills] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('Remote')
  const [advanced, setAdvanced] = useState('')

  useEffect(()=>{
    const q = buildQuery()
    onGenerate(q)
  }, [skills, title, location, advanced, platform])

  function buildQuery(){
    if(advanced) return advanced
    const skillPart = skills.split(',').map(s=>s.trim()).filter(Boolean).map(s=>`"${s}"`).join(' OR ')
    const parts = []
    if(skillPart) parts.push(`(${skillPart})`)
    if(title) parts.push(`("${title}")`)
    if(location) parts.push(`("${location}")`)
    const joined = parts.join(' AND ')
    switch(platform){
      case 'LinkedIn': return `site:linkedin.com/in (${joined})`
      case 'GitHub': return `site:github.com (${joined})`
      case 'StackOverflow': return `site:stackoverflow.com (${joined})`
      default: return joined
    }
  }

  return (
    <motion.div className="bg-white rounded-2xl shadow-md p-6" initial={{y:6, opacity:0}} animate={{y:0, opacity:1}}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Boolean / X-ray Builder</h2>
        <button onClick={()=>{ setSkills(''); setTitle(''); setLocation('Remote'); setAdvanced('') }} className="text-sm text-gray-500">Reset</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input value={skills} onChange={e=>setSkills(e.target.value)} placeholder="Skills (comma separated)" className="p-2 border rounded" />
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Job title" className="p-2 border rounded" />
        <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location (Remote / City)" className="p-2 border rounded" />
      </div>
      <div className="mt-3">
        <label className="text-sm text-gray-600">Advanced query (optional)</label>
        <textarea value={advanced} onChange={e=>setAdvanced(e.target.value)} rows={3} className="w-full p-2 border rounded mt-1" placeholder='Paste advanced query like: site:linkedin.com/in "Python" AND "Django"'></textarea>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={()=>onGenerate(buildQuery())} className="px-4 py-2 rounded-lg bg-accent text-white">Generate</button>
        <button onClick={()=>{ navigator.clipboard.writeText(buildQuery()); alert('Copied to clipboard') }} className="px-4 py-2 rounded-lg border">Copy</button>
      </div>
    </motion.div>
  )
}
