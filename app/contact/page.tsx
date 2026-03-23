import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import { settingsData } from '@/settings'
import Link from 'next/link'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the SIRAA team. We reply within 24 hours.',
}

export default function ContactPage() {
  return (
    <div className="page">
      <Header />

      <Link
          href="/"
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: "var(--space-2)", marginLeft: 'var(--space-4)',  display: "inline-flex", marginTop: 'var(--space-2)'}}
        >
          {"←"} Back to Home
        </Link>

      {/* ─── HERO ─── */}
      <section style={{
        background: 'var(--neutral-950)',
        borderBottom: '1px solid var(--neutral-800)',
        padding: 'var(--space-16) var(--space-4)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgb(248 50 50 / 0.12), transparent)',
        }} />

        <div className="container-sm" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="hero-eyebrow" style={{ margin: '0 auto var(--space-5)' }}>
            📬 Get In Touch
          </div>
          <h1 className="hero-title" style={{ marginBottom: 'var(--space-4)' }}>
            We're here to <span className="accent">help</span>
          </h1>
          <p className="hero-sub" style={{ margin: '0 auto' }}>
            Have a question, suggestion, or need support?
            Send us a message and we'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      <main className="container-sm" style={{ padding: 'var(--space-12) var(--space-4)' }}>

        {/* ─── INFO CARDS ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-10)',
        }}
          className="stagger animate-fade-in"
        >
          {[
            {
              icon: '📧',
              title: 'Email Us',
              value: `${settingsData.supportMail}`,
              sub: 'We reply within 24h',
              href: `mailto:${settingsData.supportMail}`,
            },
            {
              icon: '📞',
              title: 'Call Us',
              value: `${settingsData.phone1}`,
              sub: 'Mon–Fri, 9am–6pm',
              href: `tel:${settingsData.phone2}`,
            },
            {
              icon: '💬',
              title: 'WhatsApp',
              value: 'Chat with us',
              sub: 'Fastest response',
              href: `https://wa.me/${settingsData.SupportWhatsappNumber}`,
            },
          ].map((item) => (
            <a
              key={item.title}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
              className="contact-info-card"
            >
              <div style={{
                fontSize: '1.6rem',
                marginBottom: 'var(--space-3)',
                lineHeight: 1,
              }}>
                {item.icon}
              </div>
              <p style={{
                fontSize: '0.72rem', fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 'var(--space-1)',
                fontFamily: 'var(--font-body)',
              }}>
                {item.title}
              </p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: '0.95rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                marginBottom: '3px',
              }}>
                {item.value}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                {item.sub}
              </p>
            </a>
          ))}
        </div>

        {/* ─── CONTACT FORM ─── */}
        <div className="animate-slide-up">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <p className="label" style={{ marginBottom: 'var(--space-1)' }}>
              Send a Message
            </p>
            <h2 style={{ fontSize: '1.5rem' }}>How can we help?</h2>
          </div>
          <ContactForm />
        </div>

        {/* ─── FAQ TEASER ─── */}
        <div style={{
          marginTop: 'var(--space-12)',
          textAlign: 'center',
          padding: 'var(--space-8)',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--border-default)',
        }}
          className="animate-fade-in"
        >
          <p style={{ fontSize: '1.5rem', marginBottom: 'var(--space-3)' }}>💡</p>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>
            Looking for quick answers?
          </h3>
          <p style={{
            fontSize: '0.875rem', color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-5)', maxWidth: '360px', margin: '0 auto var(--space-5)',
          }}>
            Check out our help center for answers to common questions about
            listing vehicles, pricing, and more.
          </p>
          <a
            href="/explore"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Browse Vehicles Instead
          </a>
        </div>

      </main>

      <Footer />
    </div>
  )
}