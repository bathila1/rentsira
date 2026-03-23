import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'SIRAA — Vehicle Rental Platform Sri Lanka',
    template: '%s | SIRAA',   // ← "Toyota Premio | SIRAA"
  },
  description: 'Find and rent cars, vans, SUVs and more across all 25 districts in Sri Lanka. With or without driver.',
  keywords: ['vehicle rental', 'car rent', 'Sri Lanka', 'rent a car', 'van hire'],
  openGraph: {
    siteName: 'SIRAA',
    locale: 'en_LK',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}