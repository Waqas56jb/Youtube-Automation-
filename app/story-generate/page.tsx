"use client";
import { useEffect, useState } from 'react';
import { generateStory } from '../../lib/api';
import Shell from '../../components/Shell'

export default function Page() {
  const [transcript, setTranscript] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('transcriptPayload');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { transcript?: string };
          if (parsed?.transcript) setTranscript(parsed.transcript);
        } catch {}
      }
    }
  }, []);

  return (
    <Shell title="Story Generate">
      <div className="space-y-6">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_20%_10%,rgba(124,58,237,.25),transparent_60%),radial-gradient(60%_80%_at_80%_10%,rgba(59,130,246,.25),transparent_60%),radial-gradient(80%_60%_at_50%_100%,rgba(16,185,129,.18),transparent_60%)]" />
          <div className="relative p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold">Turn transcripts into stories</h2>
                <p className="mt-1 text-xs sm:text-sm text-[#b5b5b5]">Paste or import transcript text and generate a concise, engaging story.</p>
              </div>
              <div className="flex gap-2">
                <Preset onClick={() => setTranscript(t=>`${t}${t && !t.endsWith('\n') ? '\n' : ''}Summarize key insights in 3 short paragraphs. Focus on benefits and clarity.`)}>Blog-style</Preset>
                <Preset onClick={() => setTranscript(t=>`${t}${t && !t.endsWith('\n') ? '\n' : ''}Craft a short narrative hook (2-3 lines), then a punchy takeaway.`)}>Narrative</Preset>
                <Preset onClick={() => setTranscript(t=>`${t}${t && !t.endsWith('\n') ? '\n' : ''}Transform into a reel script: hook • value • CTA. Max 120 words.`)}>Reel/Short</Preset>
              </div>
            </div>
          </div>
        </div>

        {/* Input and actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e0f14] to-[#0b0c10] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Transcript</h3>
              <div className="text-[11px] text-[#b5b5b5]">{transcript.trim().split(/\s+/).filter(Boolean).length} words</div>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste transcript text here..."
              className="w-full h-64 p-4 rounded-lg border border-white/10 bg-[#0f0f12] text-foreground placeholder-[#666] resize-none focus:outline-none focus:ring-2 focus:ring-white/10"
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                disabled={!transcript.trim() || busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const res = await generateStory(transcript);
                    setOutput(res.story);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="px-5 py-2 rounded-lg bg-panelActive border border-[#3a3a3a] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors"
              >
                {busy ? 'Generating…' : 'Generate Story'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-panel p-4 sm:p-5">
            <h3 className="text-lg font-medium">Output</h3>
            <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-4 min-h-40 whitespace-pre-wrap text-sm text-[#e5e5e5]">
              {output || 'Your generated story will appear here.'}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                disabled={!output}
                onClick={() => {
                  if (!output) return;
                  navigator.clipboard?.writeText(output).catch(()=>{})
                }}
                className="px-4 py-2 rounded-lg bg-panel border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-panelHover transition-colors"
              >
                Copy
              </button>
              <button
                disabled={!output}
                onClick={() => {
                  if (!output) return;
                  const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'story.txt';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 rounded-lg bg-panel border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-panelHover transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function Preset({ children, onClick }: { children: React.ReactNode, onClick: ()=>void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center rounded-full border border-white/10 bg-black/30 backdrop-blur px-3 py-1 text-xs text-white/80 hover:bg-black/40">
      {children}
    </button>
  )
}


