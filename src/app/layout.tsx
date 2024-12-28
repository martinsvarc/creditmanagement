import { Montserrat } from 'next/font/google'
import '@/globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '800'],
  variable: '--font-montserrat',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-montserrat`}>{children}</body>
    </html>
  )
}

