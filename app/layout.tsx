import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {

  
  title: 'Manu AI',
  description: 'AI toolkit UI',
}

import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'

const DynamicChatFab = dynamic(() => import('../components/ChatFab'), { ssr: false })

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Client chat widget */}
        <DynamicChatFab />
      </body>
    </html>
  )
}


