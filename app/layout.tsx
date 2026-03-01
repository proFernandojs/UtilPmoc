import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: 'UTIL PMOC - Gerador de PMOC para Ar Condicionado',
  description: 'Sistema completo de gestao de manutencao, operacao e controle para sistemas de climatizacao. Gere seu PMOC conforme Lei 13.589/2018.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#3b5fcc',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${_inter.variable} ${_jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
