"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoName, setDemoName] = useState('');
  const [demoMobile, setDemoMobile] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoLoading(true);
    setDemoError(null);
    try {
      const { error } = await supabase.from('demo_requests').insert([{
        name: demoName,
        mobile: demoMobile,
        created_at: new Date().toISOString(),
      }]);
      if (error) throw error;
      setDemoSuccess(true);
      setDemoName('');
      setDemoMobile('');
    } catch (err) {
      setDemoError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => { if (isMobileMenuOpen) setIsMobileMenuOpen(false); };
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobileMenuOpen && !(e.target as Element).closest('nav')) setIsMobileMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const features = [
    { icon: "⚡", title: "Easy-to-Use Platform", desc: "Simple and intuitive system designed for smooth daily use by real estate consultants." },
    { icon: "🔄", title: "Regular Data Updates", desc: "Verified property data refreshed regularly to ensure accuracy and relevance." },
    { icon: "👥", title: "Backend Team Support", desc: "Dedicated team manages data verification and updates to reduce consultant effort." },
    { icon: "🔍", title: "Smart Filters & Exploration", desc: "Quickly search and shortlist properties using area, budget, and property-type filters." },
    { icon: "🗺️", title: "Map-Attached Properties", desc: "Each property includes location mapping for better area clarity and site planning." },
    { icon: "🤖", title: "AI-Assisted Platform", desc: "Smart assistance improves property discovery and supports faster decision-making." },
  ];

  const benefits = [
    { icon: "🏠", title: "Grow Your Property Inventory", desc: "Access a large pool of verified and active property data to offer more options to your clients." },
    { icon: "💰", title: "Save Cost on Data & Operations", desc: "Get verified property data without spending on multiple tools or manual efforts." },
    { icon: "⏱", title: "Save Time on Daily Work", desc: "Reduce time spent on searching, verifying, and managing property information." },
    { icon: "📈", title: "Increase Deal Conversion", desc: "Accurate and updated data helps you close deals faster with better client confidence." },
  ];

  const journey = [
    { icon: "✅", label: "Verified Data" },
    { icon: "⚡", label: "Faster Shortlists" },
    { icon: "🤝", label: "Confident Clients" },
    { icon: "🔑", label: "Faster Closures" },
    { icon: "📈", label: "Business Growth" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-[15px] text-slate-900 tracking-tight">
            Property<span className="text-blue-600">Hub</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {[['#features', 'Features'], ['#benefits', 'Benefits'], ['#workflow', 'How it works'], ['#contact', 'Contact']].map(([href, label]) => (
              <Link key={href} href={href} className="text-[13px] text-gray-500 hover:text-slate-900 transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <button
            className="md:hidden p-1.5 rounded text-gray-500 hover:text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-1 bg-white">
            {[['#features', 'Features'], ['#benefits', 'Benefits'], ['#workflow', 'How it works'], ['#contact', 'Contact']].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}
                className="block px-2 py-2 text-sm text-gray-600 hover:text-slate-900 rounded">
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="home" className="bg-slate-950 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block text-[11px] font-semibold text-blue-400 tracking-widest uppercase mb-7 px-3 py-1 rounded-full border border-blue-900/50 bg-blue-950/50">
            Professional Real Estate Platform
          </span>
          <h1 className="text-[1.85rem] sm:text-[2.25rem] md:text-[2.75rem] font-bold text-white leading-[1.2] tracking-tight mb-5">
            Property data platform for<br className="hidden sm:block" />
            <span className="text-blue-400"> real estate consultants</span>
          </h1>
          <p className="text-gray-400 text-[15px] sm:text-base leading-relaxed mb-9 max-w-md mx-auto">
            Verified, regularly updated property data to help consultants reduce manual effort, build client trust, and close deals faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Access Dashboard
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <button
              onClick={() => { setShowDemoModal(true); setDemoSuccess(false); setDemoError(null); }}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-white/70 border border-white/15 hover:text-white hover:border-white/30 transition-colors">
              Request a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 sm:mb-10">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Features</p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Built for real estate consultants</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-150">
                <span className="text-xl mb-3 block">{f.icon}</span>
                <h3 className="text-[13px] font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-14 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 sm:mb-10">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Why PropertyHub</p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">What consultants gain</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-150">
                <span className="text-xl flex-shrink-0 mt-0.5">{b.icon}</span>
                <div>
                  <h3 className="text-[13px] font-semibold text-slate-900 mb-1">{b.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section id="workflow" className="py-14 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 sm:mb-10">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Your journey</p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">From data to business growth</h2>
          </div>

          {/* Desktop */}
          <div className="hidden sm:flex items-center justify-between">
            {journey.map((step, i) => (
              <div key={i} className="flex items-center flex-1 min-w-0">
                <div className="text-center flex-1 px-2">
                  <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-2.5 text-lg shadow-sm">
                    {step.icon}
                  </div>
                  <p className="text-[12px] font-medium text-gray-700 leading-tight">{step.label}</p>
                </div>
                {i < journey.length - 1 && (
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Mobile */}
          <div className="sm:hidden space-y-2">
            {journey.map((step, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-100">
                  <span className="text-base">{step.icon}</span>
                  <span className="text-[13px] font-medium text-gray-700">{step.label}</span>
                </div>
                {i < journey.length - 1 && (
                  <div className="flex justify-center py-1">
                    <svg className="w-3.5 h-3.5 text-gray-300 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Contact */}
      <section id="contact" className="py-14 sm:py-20 px-4 sm:px-6 bg-slate-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-gray-400 text-[14px] sm:text-[15px] mb-8 leading-relaxed">
            Join real estate consultants using PropertyHub to work smarter and close more deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center mb-10">
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Access Dashboard
            </Link>
            <button
              onClick={() => { setShowDemoModal(true); setDemoSuccess(false); setDemoError(null); }}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-white/70 border border-white/15 hover:text-white hover:border-white/30 transition-colors">
              Request a Demo
            </button>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
            <a href="tel:+916359806195" className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              63598 06195
            </a>
            <a href="mailto:propertyhub1987@gmail.com" className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              propertyhub1987@gmail.com
            </a>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/propertyhub1987?igsh=Yjl2ZXpwNzMxNXVz" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram" className="text-gray-500 hover:text-pink-400 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61579833831698&mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook" className="text-gray-500 hover:text-blue-400 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span className="text-[12px] font-semibold text-gray-600">PropertyHub</span>
          <span className="text-[11px] text-gray-700">© 2025 All rights reserved.</span>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-900">Request a Demo</h3>
              <button onClick={() => setShowDemoModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {demoSuccess ? (
              <div className="text-center py-6">
                <p className="text-2xl mb-3">✅</p>
                <p className="text-sm font-semibold text-slate-900 mb-1">Request submitted!</p>
                <p className="text-xs text-gray-500 mb-5">We&apos;ll get in touch with you shortly.</p>
                <button onClick={() => setShowDemoModal(false)}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Name</label>
                  <input type="text" required value={demoName} onChange={e => setDemoName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 text-slate-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Mobile Number</label>
                  <input type="tel" required value={demoMobile} onChange={e => setDemoMobile(e.target.value)}
                    placeholder="Your mobile number"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 text-slate-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                </div>
                {demoError && <p className="text-xs text-red-500">{demoError}</p>}
                <button type="submit" disabled={demoLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  {demoLoading ? 'Submitting…' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
