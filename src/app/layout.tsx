import { Montserrat } from 'next/font/google'
import "@/styles/globals.css"
import { Toaster } from "sonner"

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
      <body className={`${montserrat.variable} font-montserrat`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#18181B',
              color: '#fff',
              border: 'none',
            },
            duration: 2000,
          }}
        />
      </body>
    </html>
  )
}
