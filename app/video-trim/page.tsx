"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '../../components/Shell'
import { API_BASE } from '../../lib/api'

export default function Page() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourcePath, setSourcePath] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [clips, setClips] = useState<{ start: number, end: number }[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); }
  };

  useEffect(() => {
    const upload = async () => {
      if (!selectedFile) return;
      const form = new FormData();
      form.append('file', selectedFile);
      const res = await fetch(`${API_BASE}/video/upload`, { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setSourcePath(data.source_path);
    };
    upload().catch(() => setSourcePath(null));
  }, [selectedFile]);

  // Stabilize preview URL so video doesn't reset while typing
  useEffect(() => {
    if (!selectedFile) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setObjectUrl(url);
    return () => { URL.revokeObjectURL(url); };
  }, [selectedFile]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Shell title="Video Trim">
      <div className="space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_20%_10%,rgba(124,58,237,.25),transparent_60%),radial-gradient(60%_80%_at_80%_10%,rgba(59,130,246,.25),transparent_60%),radial-gradient(80%_60%_at_50%_100%,rgba(16,185,129,.18),transparent_60%)]" />
          <div className="relative p-4 sm:p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold">Trim videos into clips</h3>
                <p className="text-xs sm:text-sm text-[#b5b5b5] mt-1">Upload a video, set start/end, queue clips, and continue to schedule.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Stat label="Queued" value={clips.length.toString()} color="from-emerald-500/30 to-lime-500/30" />
                <Stat label="Source" value={selectedFile ? 'Loaded' : 'None'} color="from-sky-500/30 to-cyan-500/30" />
                <Stat label="Duration" value={videoRef.current ? formatTime(Math.floor(videoRef.current.duration||0)) : '--:--'} color="from-indigo-500/30 to-blue-500/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Upload */}
        {!selectedFile && (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-dashed border-white/10 bg-black/20 backdrop-blur p-8 text-center">
              <div className="space-y-4">
                <div className="text-5xl">🎬</div>
                <div>
                  <p className="text-foreground font-medium">Drop your video here or click to browse</p>
                  <p className="text-sm text-[#b5b5b5] mt-1">Supports MP4, MOV, MKV, WEBM, AVI and more</p>
                </div>
                <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" id="video-upload" />
                <label htmlFor="video-upload" className="inline-block px-6 py-2 rounded-lg bg-panel border border-border text-foreground hover:bg-panelHover cursor-pointer transition-colors">
                  Choose Video File
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Trimmer */}
        {selectedFile && (
          <div className="space-y-6">
            <div className="mx-auto max-w-2xl w-full">
              <div className="rounded-2xl border border-white/10 bg-[#0f0f12] shadow-sm overflow-hidden">
                <div className="aspect-video bg-black">
                  <video ref={videoRef} controls className="w-full h-full object-contain" src={objectUrl ?? undefined} />
                </div>
                <div className="p-3 border-t border-white/10 text-xs text-[#b5b5b5] truncate">
                  {selectedFile?.name}
                </div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Start (seconds)</label>
                  <input type="number" min={0} value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="0" className="w-full p-3 rounded-lg border border-white/10 bg-[#0e0e10] text-foreground placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/10" />
                  <button type="button" onClick={() => { if (videoRef.current) setStartTime(String(Math.floor(videoRef.current.currentTime))); }} className="text-xs px-3 py-1 rounded bg-black/20 border border-white/10 hover:bg-black/30">
                    Set from current time
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">End (seconds)</label>
                  <input type="number" min={0} value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="10" className="w-full p-3 rounded-lg border border-white/10 bg-[#0e0e10] text-foreground placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/10" />
                  <button type="button" onClick={() => { if (videoRef.current) setEndTime(String(Math.floor(videoRef.current.currentTime))); }} className="text-xs px-3 py-1 rounded bg-black/20 border border-white/10 hover:bg-black/30">
                    Set from current time
                  </button>
                </div>
                <div className="flex items-end gap-3">
                  <button type="button" disabled={!startTime || !endTime} onClick={() => {
                    const s = Number(startTime); const e = Number(endTime);
                    if (Number.isFinite(s) && Number.isFinite(e) && s >= 0 && e > s) { setClips((prev) => [...prev, { start: s, end: e }]); }
                  }} className="px-6 py-2 rounded-lg bg-panelActive border border-[#3a3a3a] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors">
                    ➕ Add Clip
                  </button>
                  <button type="button" onClick={() => { setStartTime(''); setEndTime(''); }} className="px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-foreground hover:bg-black/30">
                    Clear
                  </button>
                </div>
              </div>

              {clips.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Queued Clips</h4>
                    <button type="button" onClick={() => setClips([])} className="text-xs px-3 py-1 rounded bg-black/20 border border-white/10 hover:bg-black/30">Clear All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {clips.map((c, i) => (
                      <div key={i} className="rounded-lg border border-white/10 bg-[#0b0c10] p-3 flex items-center justify-between">
                        <div className="text-sm">
                          <div className="font-medium">Clip {i + 1}</div>
                          <div className="text-[11px] text-[#b5b5b5]">{formatTime(c.start)} - {formatTime(c.end)}</div>
                        </div>
                        <button onClick={() => setClips(prev => prev.filter((_,idx)=> idx!==i))} className="text-[11px] px-2 py-1 rounded border border-white/10 bg-black/20 hover:bg-black/30">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => { setSelectedFile(null); setSourcePath(null); setClips([]); setStartTime(''); setEndTime(''); }} className="px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-foreground hover:bg-black/30">
                  Change Video
                </button>
                <button type="button" disabled={!sourcePath || clips.length === 0} onClick={async () => {
                  const res = await fetch(`${API_BASE}/video/trim`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source_path: sourcePath, clips }) });
                  if (!res.ok) throw new Error('Trim failed');
                  const data = await res.json();
                  try {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('trimmedClips', JSON.stringify({ source: sourcePath, clips: data.clips }));
                    }
                  } catch {}
                  router.push('/schedule-post');
                }} className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500/30 via-sky-500/30 to-fuchsia-500/30 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-500/40 hover:to-fuchsia-500/40">
                  ✂️ Trim & Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}

function Stat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className={`hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-br ${color} px-3 py-2 backdrop-blur shadow-sm`}>
      <div className="text-[11px] text-white/70">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  )
}