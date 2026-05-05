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
    {
      emoji: "⚡",
      title: "Easy-to-Use Platform",
      desc: "Simple and intuitive system designed for smooth daily use by real estate consultants.",
      iconBg: "from-blue-500 to-blue-600",
    },
    {
      emoji: "🔄",
      title: "Regular Data Updates",
      desc: "Verified property data refreshed regularly to ensure accuracy and relevance.",
      iconBg: "from-emerald-500 to-teal-500",
    },
    {
      emoji: "👥",
      title: "Backend Team Support",
      desc: "Dedicated team manages data verification and updates to reduce consultant effort.",
      iconBg: "from-violet-500 to-purple-600",
    },
    {
      emoji: "🔍",
      title: "Smart Filters & Exploration",
      desc: "Quickly search and shortlist properties using area, budget, and property-type filters.",
      iconBg: "from-amber-500 to-orange-500",
    },
    {
      emoji: "🗺️",
      title: "Map-Attached Properties",
      desc: "Each property includes location mapping for better area clarity and site planning.",
      iconBg: "from-indigo-500 to-blue-500",
    },
    {
      emoji: "🤖",
      title: "AI-Assisted Platform",
      desc: "Smart assistance improves property discovery and supports faster decision-making.",
      iconBg: "from-cyan-500 to-teal-500",
    },
  ];

  const benefits = [
    {
      emoji: "🏠",
      title: "Grow Your Property Inventory",
      desc: "Access a large pool of verified and active property data to offer more options to your clients.",
      card: "bg-blue-50/70 border-blue-100",
      icon: "bg-blue-100 text-blue-600",
    },
    {
      emoji: "💰",
      title: "Save Cost on Data & Operations",
      desc: "Get verified property data without spending on multiple tools or manual efforts.",
      card: "bg-emerald-50/70 border-emerald-100",
      icon: "bg-emerald-100 text-emerald-600",
    },
    {
      emoji: "⏱",
      title: "Save Time on Daily Work",
      desc: "Reduce time spent on searching, verifying, and managing property information.",
      card: "bg-violet-50/70 border-violet-100",
      icon: "bg-violet-100 text-violet-600",
    },
    {
      emoji: "📈",
      title: "Increase Deal Conversion",
      desc: "Accurate and updated data helps you close deals faster with better client confidence.",
      card: "bg-amber-50/70 border-amber-100",
      icon: "bg-amber-100 text-amber-600",
    },
  ];

  const journey = [
    { icon: "✅", label: "Verified Data",      color: "from-blue-500 to-blue-600" },
    { icon: "⚡", label: "Faster Shortlists",   color: "from-indigo-500 to-violet-500" },
    { icon: "🤝", label: "Confident Clients",   color: "from-violet-500 to-purple-500" },
    { icon: "🔑", label: "Faster Closures",     color: "from-purple-500 to-pink-500" },
    { icon: "📈", label: "Business Growth",     color: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-[15px] text-slate-900 tracking-tight select-none">
            Property<span className="text-blue-600">Hub</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {[['#features','Features'],['#benefits','Benefits'],['#workflow','How it works'],['#contact','Contact']].map(([href,label]) => (
              <Link key={href} href={href} className="text-[13px] text-gray-500 hover:text-slate-900 transition-colors duration-200">
                {label}
              </Link>
            ))}
          </div>

          <Link href="/login"
            className="hidden md:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
            Access Dashboard
          </Link>

          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
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

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {[['#features','Features'],['#benefits','Benefits'],['#workflow','How it works'],['#contact','Contact']].map(([href,label]) => (
              <Link key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-[14px] text-gray-600 hover:text-slate-900 hover:bg-gray-50 rounded-lg transition-colors">
                {label}
              </Link>
            ))}
            <div className="pt-2 mt-1 border-t border-gray-100">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-[14px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg text-center transition-colors">
                Access Dashboard
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section id="home" className="relative bg-slate-950 overflow-hidden">
        {/* Subtle ambient glow — low opacity, slow pulse */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-[0.12] animate-pulse"
            style={{ background: 'radial-gradient(ellipse, #3b82f6 0%, transparent 65%)', animationDuration: '7s' }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/40 text-blue-300 text-[11px] font-semibold px-3.5 py-1.5 rounded-full mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
            Professional Real Estate Platform
          </div>

          <h1 className="text-[2.1rem] sm:text-[2.75rem] md:text-[3.25rem] font-bold text-white tracking-tight leading-[1.1] mb-6">
            Property data platform for
            <br className="hidden sm:block" />
            <span className="text-blue-400"> real estate consultants</span>
          </h1>

          <p className="text-gray-400 text-[15px] sm:text-[16.5px] leading-relaxed mb-10 max-w-lg mx-auto">
            Property Hub provides verified, regularly updated property data to help consultants reduce manual effort, build client trust, and close deals faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/login"
              className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-0.5">
              Access Dashboard
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <button
              onClick={() => { setShowDemoModal(true); setDemoSuccess(false); setDemoError(null); }}
              className="inline-flex items-center justify-center px-7 py-3 rounded-xl text-sm font-semibold text-white/70 border border-white/15 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200">
              Request a Demo
            </button>
          </div>

          {/* Platform trust chips */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2.5">
            {['Verified listings','Regular data updates','AI-powered search','Map-linked properties'].map((chip, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[12px] text-gray-500">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0" />
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-14">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.15em] mb-3">Platform Features</p>
            <h2 className="text-[1.5rem] sm:text-[1.875rem] font-bold text-slate-900 mb-3 tracking-tight">
              Everything you need to work smarter
            </h2>
            <p className="text-gray-500 text-[14px] sm:text-[15px] max-w-xl mx-auto leading-relaxed">
              Six tools built to help real estate consultants find listings faster, shortlist with confidence, and close more deals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60 hover:border-gray-200 transition-all duration-300 cursor-default">
                <div className={`w-10 h-10 bg-gradient-to-br ${f.iconBg} rounded-xl flex items-center justify-center mb-4 text-[17px] shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {f.emoji}
                </div>
                <h3 className="text-[14px] font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Benefits ─── */}
      <section id="benefits" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-14">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.15em] mb-3">Why PropertyHub</p>
            <h2 className="text-[1.5rem] sm:text-[1.875rem] font-bold text-slate-900 mb-3 tracking-tight">
              What consultants gain
            </h2>
            <p className="text-gray-500 text-[14px] sm:text-[15px] max-w-md mx-auto leading-relaxed">
              Designed to give real estate consultants a measurable edge in their daily work.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <div key={i}
                className={`${b.card} border rounded-2xl p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300`}>
                <div className="flex items-start gap-4">
                  <div className={`${b.icon} w-10 h-10 rounded-xl flex items-center justify-center text-[17px] flex-shrink-0`}>
                    {b.emoji}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-slate-900 mb-1.5">{b.title}</h3>
                    <p className="text-[13px] text-gray-600 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Journey ─── */}
      <section id="workflow" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-14">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.15em] mb-3">Your success journey</p>
            <h2 className="text-[1.5rem] sm:text-[1.875rem] font-bold text-slate-900 mb-3 tracking-tight">
              From data to business growth
            </h2>
            <p className="text-gray-500 text-[14px] sm:text-[15px] max-w-md mx-auto leading-relaxed">
              How PropertyHub turns verified data into real results for your brokerage.
            </p>
          </div>

          {/* Desktop horizontal flow */}
          <div className="hidden sm:block">
            <div className="relative">
              {/* Gradient connector line */}
              <div className="absolute top-[22px] left-[10%] right-[10%] h-px bg-gradient-to-r from-blue-200 via-purple-200 to-emerald-200" />
              <div className="grid grid-cols-5 gap-3">
                {journey.map((step, i) => (
                  <div key={i} className="group text-center">
                    <div className={`relative z-10 w-11 h-11 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mx-auto mb-3 text-[17px] shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                      {step.icon}
                    </div>
                    <p className="text-[12.5px] font-semibold text-slate-700 leading-tight">{step.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile vertical flow */}
          <div className="sm:hidden space-y-2">
            {journey.map((step, i) => (
              <div key={i}>
                <div className="flex items-center gap-3.5 bg-white p-4 rounded-xl border border-gray-100">
                  <div className={`w-9 h-9 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-[16px] flex-shrink-0 shadow-sm`}>
                    {step.icon}
                  </div>
                  <span className="text-[14px] font-semibold text-slate-700">{step.label}</span>
                  {i < journey.length - 1 && (
                    <svg className="w-4 h-4 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
                {i < journey.length - 1 && (
                  <div className="flex justify-center"><div className="w-px h-3 bg-gray-200" /></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA + Contact ─── */}
      <section id="contact" className="relative bg-slate-950 overflow-hidden">
        {/* Subtle bottom ambient glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-[0.1] animate-pulse"
            style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 65%)', animationDuration: '9s' }}
          />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h2 className="text-[1.5rem] sm:text-[1.875rem] font-bold text-white mb-4 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-gray-400 text-[14px] sm:text-[15px] mb-10 leading-relaxed max-w-md mx-auto">
            Join real estate consultants using PropertyHub to work smarter, save time, and close more deals.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/login"
              className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-0.5">
              Access Dashboard
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <button
              onClick={() => { setShowDemoModal(true); setDemoSuccess(false); setDemoError(null); }}
              className="inline-flex items-center justify-center px-7 py-3 rounded-xl text-sm font-semibold text-white/70 border border-white/15 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200">
              Request a Demo
            </button>
          </div>

          {/* Contact info */}
          <div className="border-t border-white/10 pt-9">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em] mb-5">Get in touch</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-6">
              <a href="tel:+916359806195"
                className="flex items-center gap-2 text-[13px] text-gray-400 hover:text-white transition-colors duration-200">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                63598 06195
              </a>
              <a href="mailto:propertyhub1987@gmail.com"
                className="flex items-center gap-2 text-[13px] text-gray-400 hover:text-white transition-colors duration-200">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                propertyhub1987@gmail.com
              </a>
            </div>
            <div className="flex justify-center gap-3">
              <a href="https://www.instagram.com/propertyhub1987?igsh=Yjl2ZXpwNzMxNXVz" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-center text-gray-500 hover:text-pink-400 transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61579833831698&mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-400 transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-950 border-t border-white/5 py-5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[13px] font-bold text-gray-500">
            Property<span className="text-blue-600/80">Hub</span>
          </span>
          <span className="text-[11px] text-gray-700">© 2025 PropertyHub. All rights reserved.</span>
        </div>
      </footer>

      {/* ─── Demo Modal ─── */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 w-full max-w-sm shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">Request a Demo</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">We&apos;ll get in touch shortly</p>
              </div>
              <button onClick={() => setShowDemoModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {demoSuccess ? (
              <div className="text-center py-5">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                  ✅
                </div>
                <p className="text-[15px] font-semibold text-slate-900 mb-1.5">Request submitted!</p>
                <p className="text-[13px] text-gray-400 mb-6">We&apos;ll get in touch with you shortly.</p>
                <button onClick={() => setShowDemoModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Name</label>
                  <input type="text" required value={demoName} onChange={e => setDemoName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 text-slate-900 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Mobile Number</label>
                  <input type="tel" required value={demoMobile} onChange={e => setDemoMobile(e.target.value)}
                    placeholder="Your mobile number"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 text-slate-900 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
                </div>
                {demoError && <p className="text-[12px] text-red-500">{demoError}</p>}
                <button type="submit" disabled={demoLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
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
