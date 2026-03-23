import type { Metadata } from 'next'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Siraa seller account.',
}

export default function LoginPage() {
  return <LoginClient />
}