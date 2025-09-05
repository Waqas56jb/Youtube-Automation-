"use client";
import { useEffect } from 'react'
import Shell from '../../components/Shell'

// Simple SVG icons for platform cards (official-esque)
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8ZM9.8 15.5v-7l6 3.5-6 3.5Z"/></svg>
)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden><path fill="currentColor" d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.2 3-3.2.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.3 3h-1.9v7A10 10 0 0 0 22 12Z"/></svg>
)
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden><path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8 8.5h3.8v2h.1c.5-1 1.8-2.1 3.8-2.1 4 0 4.7 2.7 4.7 6.3V23h-4v-6.5c0-1.5 0-3.5-2.2-3.5-2.2 0-2.5 1.7-2.5 3.4V23H8V8.5z"/></svg>
)
const TiktokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden><path fill="currentColor" d="M21 8.2c-2.2-.6-3.7-2.2-4.1-4.3h0V3h-3v12.3a3.3 3.3 0 1 1-2.3-3.1V9.1A6.4 6.4 0 1 0 14.9 21V9.7c1.1 1 2.5 1.7 4.1 1.9V8.2z"/></svg>
)

export default function Page() {
  useEffect(() => {
    // Placeholder for chart libs if later added
  }, [])

  return (
    <Shell title="Analytics Dashboard">
      <div className="space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Views', value: '1.2M', delta: '+8.3%' },
            { label: 'Watch Time', value: '38,420h', delta: '+4.1%' },
            { label: 'Engagement', value: '182K', delta: '+12.5%' },
            { label: 'Conversion', value: '4.7%', delta: '+0.6%' },
          ].map((k, i) => (
            <div key={i} className="rounded-xl border border-border bg-panel p-4 hover:bg-panelHover transition-colors">
              <div className="text-sm text-[#b5b5b5]">{k.label}</div>
              <div className="mt-2 text-3xl font-bold text-foreground">{k.value}</div>
              <div className="mt-1 text-xs text-green-400">{k.delta} this period</div>
            </div>
          ))}
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'YouTube', color: 'bg-[#ff0000]/10 border-[#ff0000]/20 text-[#ff0000]', Icon: YoutubeIcon },
            { name: 'Facebook', color: 'bg-[#1877f2]/10 border-[#1877f2]/20 text-[#1877f2]', Icon: FacebookIcon },
            { name: 'LinkedIn', color: 'bg-[#0a66c2]/10 border-[#0a66c2]/20 text-[#0a66c2]', Icon: LinkedinIcon },
            { name: 'TikTok', color: 'bg-[#00f2ea]/10 border-[#00f2ea]/20 text-[#00f2ea]', Icon: TiktokIcon },
          ].map(({ name, color, Icon }, i) => (
            <div key={i} className={`rounded-xl border ${color} p-4 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`p-2 rounded-lg ${color}`}><Icon /></span>
                  <div className="text-lg font-semibold text-foreground">{name}</div>
                </div>
                <div className="text-xs text-[#b5b5b5]">Last 28 days</div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-[#b5b5b5]">Posts</div>
                  <div className="font-semibold text-foreground">{Math.floor(50 + Math.random()*150)}</div>
                </div>
                <div>
                  <div className="text-[#b5b5b5]">Reach</div>
                  <div className="font-semibold text-foreground">{Math.floor(10000 + Math.random()*90000)}</div>
                </div>
                <div>
                  <div className="text-[#b5b5b5]">CTR</div>
                  <div className="font-semibold text-foreground">{(2 + Math.random()*6).toFixed(1)}%</div>
                </div>
              </div>
              <div className="mt-4 h-24 rounded-lg border border-border bg-[#0e0e10] relative overflow-hidden">
                {/* tiny area chart mimic */}
                <div className="absolute inset-0 opacity-60" style={{background: 'linear-gradient(180deg, rgba(155,181,255,0.25), transparent)'}} />
                <div className="absolute inset-0" style={{background: 'repeating-linear-gradient(90deg, transparent 0 10px, rgba(255,255,255,0.04) 10px 11px)'}} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar chart placeholder */}
          <div className="rounded-xl border border-border bg-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold text-foreground">Weekly Performance</div>
              <div className="text-xs text-[#b5b5b5]">Views vs Engagement</div>
            </div>
            <div className="grid grid-cols-7 gap-2 h-48 items-end">
              {Array.from({length:7}).map((_,i)=>{
                const v = 20+Math.random()*70
                const e = Math.max(6, v-10-Math.random()*15)
                return (
                  <div key={i} className="flex gap-1 h-full items-end">
                    <div className="w-6 bg-[#7aa2ff]/40" style={{height: `${v}%`}} />
                    <div className="w-6 bg-[#34d399]/40" style={{height: `${e}%`}} />
                  </div>
                )
              })}
            </div>
          </div>
          {/* Donut chart placeholder */}
          <div className="rounded-xl border border-border bg-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold text-foreground">Audience Breakdown</div>
              <div className="text-xs text-[#b5b5b5]">By platform</div>
            </div>
            <div className="h-48 flex items-center justify-center">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 rounded-full border-[18px] border-[#7aa2ff]/50" />
                <div className="absolute inset-0 rounded-full border-[18px] border-transparent" style={{borderTopColor:'#34d399', transform:'rotate(80deg)'}} />
                <div className="absolute inset-0 rounded-full border-[18px] border-transparent" style={{borderTopColor:'#ff8f6b', transform:'rotate(190deg)'}} />
                <div className="absolute inset-0 rounded-full border-[18px] border-transparent" style={{borderTopColor:'#a78bfa', transform:'rotate(260deg)'}} />
                <div className="absolute inset-[26%] rounded-full bg-[#0e0e10] flex items-center justify-center text-xs text-[#b5b5b5]">Distribution</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#7aa2ff]"/>YouTube 42%</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#34d399]"/>Facebook 28%</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ff8f6b]"/>LinkedIn 18%</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#a78bfa]"/>TikTok 12%</div>
            </div>
          </div>
        </div>

        {/* Map + Table Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Map placeholder */}
          <div className="xl:col-span-2 rounded-xl border border-border bg-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold text-foreground">Geographic Reach</div>
              <div className="text-xs text-[#b5b5b5]">Top regions</div>
            </div>
            <div className="h-64 rounded-lg border border-border bg-[#0e0e10] relative overflow-hidden">
              <div className="absolute inset-0" style={{background:'radial-gradient(120% 80% at 50% 50%, rgba(122,162,255,0.12), transparent 60%)'}} />
              <div className="absolute inset-0" style={{background:'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 10px, transparent 10px 20px)'}} />
              <div className="absolute inset-6 rounded-lg border border-border">
                {/* fake dots */}
                {Array.from({length:30}).map((_,i)=>{
                  const top = Math.random()*100
                  const left = Math.random()*100
                  const s = 4+Math.random()*6
                  return <span key={i} className="absolute rounded-full bg-[#7aa2ff] opacity-70" style={{top:`${top}%`, left:`${left}%`, width:s, height:s}} />
                })}
              </div>
            </div>
          </div>
          {/* Top Posts */}
          <div className="rounded-xl border border-border bg-panel p-4">
            <div className="text-lg font-semibold text-foreground mb-3">Top Performing Posts</div>
            <div className="space-y-3">
              {Array.from({length:6}).map((_,i)=> (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-2 hover:bg-panelHover">
                  <div className="text-sm text-foreground">Post #{i+1}</div>
                  <div className="text-xs text-[#b5b5b5]">{(Math.random()*100).toFixed(1)}k views</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="rounded-xl border border-border bg-panel p-4">
          <div className="text-lg font-semibold text-foreground mb-3">Activity Timeline</div>
          <div className="h-24 grid grid-cols-24 gap-1">
            {Array.from({length:24}).map((_,i)=>{
              const v = 10+Math.random()*90
              return <div key={i} className="bg-[#9bb5ff]/30" style={{height:`${v}%`}} />
            })}
          </div>
        </div>
      </div>
    </Shell>
  )
}


