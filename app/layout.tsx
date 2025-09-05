import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manu AI',
  description: 'AI toolkit UI',
}

import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Client chat widget */}
        {DynamicChatFab ? <DynamicChatFab /> : null}
      </body>
    </html>
  )
}

const DynamicChatFab = dynamic(() => import('../components/ChatFab'), { ssr: false })


