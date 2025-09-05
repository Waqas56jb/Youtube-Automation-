"use client";
import { useRef } from 'react'
import Shell from '../../components/Shell'
import { API_BASE } from '../../lib/api'

export default function Page(){
  const outRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  async function send(e: React.FormEvent){
    e.preventDefault()
    const q = (inputRef.current?.value||'').trim()
    if(!q) return
    const box = outRef.current
    if(!box) return
    const me = document.createElement('div')
    me.className = 'self-end max-w-[80%] rounded-lg bg-[#1c1f2a] border border-[#2a2f3f] p-3 text-sm'
    me.textContent = q
    box.appendChild(me)
    inputRef.current!.value = ''
    try{
      const res = await fetch(`${API_BASE}/chat`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({message:q})})
      const data = await res.json()
      const ai = document.createElement('div')
      ai.className = 'self-start max-w-[80%] rounded-lg bg-[#0f1117] border border-[#22283b] p-3 text-sm text-[#e5e5e5]'
      ai.textContent = (data.reply||'').trim() || 'No response.'
      box.appendChild(ai)
      box.scrollTop = box.scrollHeight
    }catch{
      const err = document.createElement('div')
      err.className = 'self-start max-w-[80%] rounded-lg bg-[#2a1313] border border-[#3f1f1f] p-3 text-sm text-[#ffd6d6]'
      err.textContent = 'Error contacting assistant.'
      box.appendChild(err)
    }
  }
  return (
    <Shell title="Assistant">
      <div className="h-[70vh] max-h-[720px] rounded-2xl border border-border bg-panel flex flex-col">
        <div ref={outRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2" />
        <form onSubmit={send} className="p-3 border-t border-border flex gap-2">
          <input ref={inputRef} className="flex-1 p-2 rounded border border-border bg-[#0e0e0f] text-foreground" placeholder="Type your message…" />
          <button className="px-3 py-2 rounded bg-panelActive border border-[#3a3a3a] text-white">Send</button>
        </form>
      </div>
    </Shell>
  )
}


