import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { JotaiProvider } from '@/providers/jotai-provider'
import { ReactQueryProvider } from '@/providers/react-query-provider'
import { Toaster } from '@/components/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Hệ thống Check-in',
  description: 'Ứng dụng quản lý check-in khách mời sự kiện'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='vi' className='h-full'>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <ReactQueryProvider>
          <JotaiProvider>
            <Toaster />

            <div className='h-full'>{children}</div>
          </JotaiProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
