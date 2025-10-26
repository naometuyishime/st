import type React from "react"
import type { Metadata } from "next"
import { Poppins } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationsProvider } from "@/contexts/notification-context"
import { KpiProvider } from "@/contexts/kpi-context"
import { UsersProvider } from "@/contexts/users-context"

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: "MIGEPROF Stakeholder Mapping Tool",
  description: "Stakeholder coordination and planning platform for MIGEPROF",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        <AuthProvider>
          <NotificationsProvider>
            <KpiProvider>
              <UsersProvider>
                <Suspense fallback={<div>Loading...</div>}>
                  {children}
                </Suspense>
              </UsersProvider>
            </KpiProvider>
          </NotificationsProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
