import type { Metadata } from 'next'
import RegisterClient from './RegisterClient'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a free Siraa account and start listing your vehicles for rent.',
}

export default function RegisterPage() {
  return <RegisterClient />
}