"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const nav = [
  { href: '/', label: 'Dashboard' },
  { href: '/transcript', label: 'Transcript' },
  { href: '/story-generate', label: 'Story Generate' },
  { href: '/video-trim', label: 'Video Trim' },
  { href: '/schedule-post', label: 'Schedule Post' },
  { href: '/analysis', label: 'Analysis' },
  { href: '/logout', label: 'Logout' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:block fixed left-0 top-0 h-screen w-60 border-r border-border bg-[#0a0a0a] p-4">
      <Logo />
      <div className="my-3 h-px w-full bg-border" />
      <nav className="flex flex-col gap-2">
        {nav.map((item) => {
          const active = pathname === item.href;
          const isTranscript = item.href === '/transcript';
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg border border-border bg-panel px-3 py-2 transition-all duration-200 hover:bg-panelHover hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#3a3a3a] ${active ? 'bg-panelActive border-[#3a3a3a] shadow-lg' : ''} ${isTranscript ? 'hover:border-[#3a3a3a] hover:shadow-md' : ''}`}
              title={isTranscript ? 'Upload files or write manual scripts for transcription' : ''}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


