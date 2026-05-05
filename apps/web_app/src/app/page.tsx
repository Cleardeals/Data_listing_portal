"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
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
        created_at: new Date().toISOString()
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
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Close mobile menu on scroll
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    // Close mobile menu on outside click
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = (): void => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  const closeMobileMenu = (): void => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
     

      {/* Enhanced Professional Navbar for Brokers */}
      <nav className="backdrop-blur-xl bg-slate-950/90 border-b border-slate-700/50 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50 relative shadow-xl shadow-slate-900/20">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-blue-950/95 to-slate-950/95 opacity-80"></div>
        
        <div className="relative z-10 flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/" className="group flex items-center transition-all duration-300 hover:scale-105">
            <div className="text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xl sm:text-2xl">
              <span className="text-gradient-animate">PropertyHub</span>
              <span className="block text-xs sm:text-sm font-medium text-blue-200 mt-1">Professional Portal</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="#home" className="text-white font-medium hover:text-blue-300 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10">
              HOME
            </Link>
            <Link href="#features" className="text-white font-medium hover:text-blue-300 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10">
              FEATURES
            </Link>
            <Link href="#workflow" className="text-white font-medium hover:text-blue-300 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10">
              WORKFLOW
            </Link>
          </div>
          
          {/* Mobile Hamburger Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-blue-300 p-2 rounded-lg transition-all duration-300 hover:bg-white/10"
              aria-label="Toggle mobile menu"
            >
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div className={`md:hidden absolute left-0 right-0 top-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-700/50 transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
        }`}>
          <div className="px-4 py-6 space-y-4">
            <Link 
              href="#home" 
              onClick={closeMobileMenu}
              className="block text-white font-medium hover:text-blue-300 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white/10"
            >
              HOME
            </Link>
            <Link 
              href="#features" 
              onClick={closeMobileMenu}
              className="block text-white font-medium hover:text-blue-300 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white/10"
            >
              FEATURES
            </Link>
            <Link 
              href="#workflow" 
              onClick={closeMobileMenu}
              className="block text-white font-medium hover:text-blue-300 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white/10"
            >
              WORKFLOW
            </Link>
          </div>
        </div>
      </nav>

      {/* Professional Hero Section for Brokers */}
      <div id="home" className="relative w-full min-h-[85vh] sm:min-h-[90vh] md:min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pt-8 sm:pt-12 md:pt-0">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes - responsive positioning */}
          <div className="absolute top-20 sm:top-28 md:top-20 left-5 sm:left-10 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-2xl sm:rounded-3xl transform rotate-45 float-animation"></div>
          <div className="absolute top-32 sm:top-48 md:top-40 right-10 sm:right-20 w-12 sm:w-24 h-12 sm:h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-bounce animate-delay-200"></div>
          <div className="absolute bottom-20 sm:bottom-40 left-1/4 w-14 sm:w-28 h-14 sm:h-28 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-xl sm:rounded-2xl transform -rotate-12 float-animation animate-delay-300"></div>
          <div className="absolute bottom-30 sm:bottom-60 right-1/3 w-10 sm:w-20 h-10 sm:h-20 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full animate-bounce animate-delay-500"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent grid-overlay">
          </div>
        </div>

        {/* Hero Content - Broker-Focused */}
        <div className="relative z-20 flex flex-col items-center justify-center min-h-[85vh] sm:min-h-[90vh] md:min-h-screen px-4 sm:px-6 pt-4 pb-6 sm:pt-8 sm:pb-10 md:pt-0 md:pb-0">
          {/* Main Hero Text */}
          <div className={`text-center text-white max-w-6xl mb-6 sm:mb-12 md:mb-16 transform transition-all duration-1000 translate-y-0 opacity-100`}>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight">
              <span className="text-gradient-animate">
                Professional Platform
              </span>
              <span className="block mt-2 sm:mt-4 bg-gradient-to-r from-emerald-200 via-blue-200 to-purple-200 bg-clip-text text-transparent">
                for Property Brokers
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 text-gray-200 max-w-4xl mx-auto leading-relaxed opacity-90 px-4">
              Property Hub is a professional data platform designed for real estate consultants. It provides verified, regularly updated property data to help consultants reduce manual effort, build client trust, and close deals faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
              <Link href="/login" className="group bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/25 btn-3d">
                <span className="flex items-center justify-center gap-2 sm:gap-3">
                  Access Dashboard
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              <button
                onClick={() => { setShowDemoModal(true); setDemoSuccess(false); setDemoError(null); }}
                className="group bg-white/10 backdrop-blur-sm border border-white/30 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Request a Demo
              </button>
            </div>
          </div>

          {/* Professional Stats Cards for Brokers - Ultra compact mobile design */}
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
            {/* Mobile: Super compact horizontal pill cards */}
            <div className="block sm:hidden">
              
              
              {/* Mobile: Stacked mini feature cards */}
              <div className="space-y-2 mt-3">
                {[
                  { 
                    title: "Smart Property Discovery", 
                    subtitle: "AI-Powered Search",
                    gradient: "from-blue-500/20 to-cyan-500/20",
                    icon: "🔍"
                  },
                  { 
                    title: "Sales Presentations", 
                    subtitle: "Script Generator",
                    gradient: "from-purple-500/20 to-pink-500/20",
                    icon: "📊"
                  },
                  { 
                    title: "Expert Guidance", 
                    subtitle: "Real Estate Mentor",
                    gradient: "from-emerald-500/20 to-teal-500/20",
                    icon: "🏠"
                  }
                ].map((feature, index) => (
                  <div key={index} className={`bg-gradient-to-r ${feature.gradient} p-3 rounded-lg border border-white/10 flex items-center justify-between backdrop-blur-sm transform transition-all duration-300 hover:scale-102`}>
                    <div className="flex items-center gap-3">
                      <div className="text-base">{feature.icon}</div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{feature.title}</h4>
                        <p className="text-xs text-white/80">{feature.subtitle}</p>
                      </div>
                    </div>
                    <button className="bg-white/20 text-white px-2 py-1 rounded text-xs font-medium hover:bg-white/30 transition-all duration-200 flex-shrink-0">
                      Try
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop: Enhanced Professional Grid Layout */}
            <div className="hidden sm:flex sm:justify-center">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12 max-w-6xl">
                {[
                  { 
                    title: "AI Property Search", 
                    description: "Advanced Natural Language Processing for Intelligent Property Discovery", 
                    gradient: "from-blue-500 to-cyan-500",
                    icon: "🔍",
                    accentColor: "blue"
                  },
                  { 
                    title: "Sales Script Generator", 
                    description: "AI-Powered Presentations & Personalized Client Communications", 
                    gradient: "from-purple-500 to-pink-500",
                    icon: "📊",
                    accentColor: "purple"
                  },
                  { 
                    title: "Real Estate Mentor", 
                    description: "Expert AI Guidance & Strategic Business Intelligence", 
                    gradient: "from-emerald-500 to-teal-500",
                    icon: "🏠",
                    accentColor: "emerald"
                  }
                ].map((stat, index) => (
                  <div key={index} className={`group relative bg-gradient-to-br ${stat.gradient} p-6 lg:p-8 xl:p-10 rounded-2xl lg:rounded-3xl shadow-xl backdrop-blur-lg border border-white/30 flex flex-col justify-between min-h-[240px] lg:min-h-[280px] xl:min-h-[320px] w-full max-w-sm overflow-hidden`}>
                {/* Animated background overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 opacity-0 transition-opacity duration-500"></div>
                
                {/* Floating particles effect */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-1 h-1 bg-white/40 rounded-full"></div>
                
                <div className="relative z-10 text-center flex-1 flex flex-col justify-center">
                  <div className="text-3xl lg:text-4xl mb-4 filter drop-shadow-lg">
                    {stat.icon}
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-3 leading-tight">
                    {stat.title}
                  </h3>
                  <p className="text-white/85 text-sm lg:text-base mb-4 leading-relaxed px-2">
                    {stat.description}
                  </p>
                </div>
                
                <div className="relative z-10 text-center mt-auto">
                  <button className={`bg-white/25 backdrop-blur-md text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold text-sm lg:text-base w-full shadow-lg border border-white/20`}>
                    <span className="flex items-center justify-center gap-2">
                      Explore Tool
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </button>
                </div>
                
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${stat.gradient} rounded-2xl lg:rounded-3xl blur-sm opacity-0 -z-10`}></div>
              </div>
            ))}
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Features Section for Brokers */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full text-blue-600 font-medium mb-4 sm:mb-6 border border-blue-100 shadow-sm text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Professional Broker Tools
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-8 leading-tight">
              Features Built for
              <span className="block text-gradient-animate">
                Real Estate Consultants
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
              Purpose-built tools that help real estate consultants work smarter, serve clients better, and close deals faster.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[
              {
                emoji: "⚡",
                title: "Easy-to-Use Platform",
                description: "Simple and intuitive system designed for smooth daily use by real estate consultants.",
                gradient: "from-blue-500 to-cyan-500",
                delay: "animate-delay-100"
              },
              {
                emoji: "🔄",
                title: "Regular Data Updates",
                description: "Verified property data refreshed regularly to ensure accuracy and relevance.",
                gradient: "from-emerald-500 to-teal-500",
                delay: "animate-delay-200"
              },
              {
                emoji: "👥",
                title: "Backend Team Support",
                description: "Dedicated team manages data verification and updates to reduce consultant effort.",
                gradient: "from-purple-500 to-pink-500",
                delay: "animate-delay-300"
              },
              {
                emoji: "🔍",
                title: "Smart Filters & Exploration",
                description: "Quickly search and shortlist properties using area, budget, and property-type filters.",
                gradient: "from-amber-500 to-orange-500",
                delay: "animate-delay-100"
              },
              {
                emoji: "🗺️",
                title: "Map-Attached Properties",
                description: "Each property includes location mapping for better area clarity and site planning.",
                gradient: "from-indigo-500 to-blue-500",
                delay: "animate-delay-200"
              },
              {
                emoji: "🤖",
                title: "AI-Assisted Platform",
                description: "Smart assistance improves property discovery and supports faster decision-making.",
                gradient: "from-teal-500 to-emerald-500",
                delay: "animate-delay-300"
              }
            ].map((feature, index) => (
              <div key={index} className={`card-hover-3d group bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 ${feature.delay}`}>
                <div className={`bg-gradient-to-br ${feature.gradient} text-white w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 pulse-glow text-2xl`}>
                  {feature.emoji}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
          
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/40 to-transparent rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Why Real Estate Consultants
              <span className="block text-gradient-animate">Choose Property Hub</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                emoji: "🏠",
                title: "Grow Your Property Inventory",
                description: "Access a large pool of verified and active property data to offer more options to your clients.",
                gradient: "from-blue-500/10 to-cyan-500/10",
                border: "border-blue-200"
              },
              {
                emoji: "💰",
                title: "Save Cost on Data & Operations",
                description: "Get verified property data without spending on multiple tools or manual efforts.",
                gradient: "from-emerald-500/10 to-teal-500/10",
                border: "border-emerald-200"
              },
              {
                emoji: "⏱",
                title: "Save Time on Daily Work",
                description: "Reduce time spent on searching, verifying, and managing property information.",
                gradient: "from-purple-500/10 to-pink-500/10",
                border: "border-purple-200"
              },
              {
                emoji: "📈",
                title: "Increase Deal Conversion",
                description: "Accurate and updated data helps you close deals faster with better client confidence.",
                gradient: "from-amber-500/10 to-orange-500/10",
                border: "border-amber-200"
              }
            ].map((benefit, index) => (
              <div key={index} className={`bg-gradient-to-br ${benefit.gradient} border ${benefit.border} rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300`}>
                <div className="text-3xl mb-4">{benefit.emoji}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Broker Workflow Section */}
      <section id="workflow" className="py-12 sm:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-36 sm:w-72 h-36 sm:h-72 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl float-animation animate-delay-300"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full text-purple-600 font-medium mb-4 sm:mb-6 border border-purple-100 shadow-sm text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Professional Workflow
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-8 leading-tight">
              How Professional Brokers
              <span className="block text-gradient-animate">
                Maximize Success
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
              Streamline your brokerage operations with our proven workflow designed for maximum efficiency and client satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 mb-12 sm:mb-20 relative">
            {[
              {
                step: "01",
                title: "Access Analytics Dashboard",
                description: "Start with comprehensive market analytics, property insights, and performance metrics track market trends, and identify opportunities.",
                icon: (
                  <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                ),
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50"
              },
              {
                step: "02",
                title: "Manage Client Relationships",
                description: "Utilize our AI tools to generate client specific scripts. Build lasting relationships that drive repeat business.",
                icon: (
                  <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                ),
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-50 to-pink-50"
              },
              {
                step: "03",
                title: "Understand Market Better",
                description: "Leverage filters, map view, and our Real-estate mentor to maximize your knowledge of the market and make informed decisions.",
                icon: (
                  <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ),
                gradient: "from-emerald-500 to-teal-500",
                bgGradient: "from-emerald-50 to-teal-50"
              }
            ].map((step, index) => (
              <div key={index} className="relative group">
                <div className={`card-hover-3d bg-gradient-to-br ${step.bgGradient} rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 backdrop-blur-sm`}>
                  {/* Step number background */}
                  <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-400">{step.step}</span>
                  </div>
                  
                  {/* Icon container */}
                  <div className={`bg-gradient-to-br ${step.gradient} text-white w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 pulse-glow mt-4 sm:mt-6`}>
                    {step.icon}
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 group-hover:text-blue-600 transition-colors duration-300">{step.title}</h3>
                  <p className="text-gray-700 leading-relaxed text-base sm:text-lg mb-6 sm:mb-8">{step.description}</p>
                  
                  {/* Action button */}
                  <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300 text-sm sm:text-base">
                    <span>Start Now</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-2 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Professional Connection Lines - Positioned in Card Gaps */}
            {/* First connector: In the gap between card 1 and card 2 */}
            <div className="hidden lg:block absolute top-1/2 transform -translate-y-1/2 z-10" style={{ left: 'calc(33.333% - 1rem)', width: '2rem' }}>
              <div className="relative w-full h-1">
                <div className="w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-lg"></div>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-xl border-2 border-white z-10"></div>
                {/* Flow arrow */}
                <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-[4px] border-l-purple-500 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent"></div>
              </div>
            </div>
            
            {/* Second connector: In the gap between card 2 and card 3 */}
            <div className="hidden lg:block absolute top-1/2 transform -translate-y-1/2 z-10" style={{ left: 'calc(66.666% - 1rem)', width: '2rem' }}>
              <div className="relative w-full h-1">
                <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full shadow-lg"></div>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full shadow-xl border-2 border-white z-10"></div>
                {/* Flow arrow */}
                <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-[4px] border-l-emerald-500 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent"></div>
              </div>
            </div>
          </div>
          
          {/* Professional Success Timeline */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-white/30 shadow-xl">
            <div className="text-center mb-6 sm:mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Your Success Journey</h3>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute top-8 sm:top-10 left-16 right-16 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-emerald-200 rounded-full shadow-sm"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 relative z-10">
                {[
                  { icon: "✅", title: "Verified Data" },
                  { icon: "⚡", title: "Faster Shortlists" },
                  { icon: "🤝", title: "Confident Clients" },
                  { icon: "🔑", title: "Faster Closures" },
                  { icon: "📈", title: "Business Growth" }
                ].map((phase, index) => (
                  <div key={index} className="text-center group relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 relative z-20 border-2 border-white shadow-lg">
                      <span className="text-2xl sm:text-3xl">{phase.icon}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">{phase.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional CTA Section for Brokers */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl float-animation"></div>
          <div className="absolute bottom-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl float-animation animate-delay-300"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl animate-pulse"></div>
          
          {/* Grid overlay */}
          <div className="absolute inset-0 grid-overlay opacity-30"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-3d px-4 sm:px-6 py-2 sm:py-3 rounded-full text-blue-200 font-medium mb-6 sm:mb-8 border border-white/20 text-sm sm:text-base">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Ready to Elevate Your Brokerage?
          </div>
          
          {/* Main heading */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight">
            Join the Elite Network of
            <span className="block text-gradient-animate">Professional Brokers</span>
          </h2>
          
          {/* Description */}
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your brokerage with professional tools, advanced analytics, and exclusive market insights. 
            <span className="block mt-2 text-base sm:text-xl text-blue-200">
              Your success story starts here.
            </span>
          </p>  
          {/* Professional trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10">
            {[
              { 
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ),
                text: "Verified Network",
                subtext: "Growing Community"
              },
              { 
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                ),
                text: "Secure Platform",
                subtext: "Enterprise Security"
              },
              { 
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                ),
                text: "Professional Support",
                subtext: "24/7 Dedicated"
              },
              { 
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ),
                text: "Proven ROI",
                subtext: "Significant Returns"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/10 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-white/20 transition-colors duration-300 group-hover:scale-110 transform">
                  <div className="text-blue-300 group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h4 className="font-bold text-white mb-1 text-sm sm:text-base">{feature.text}</h4>
                <p className="text-blue-200 text-xs sm:text-sm">{feature.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer with Contact */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-gradient-animate mb-2">PropertyHub</div>
              <p className="text-gray-400 text-sm">Professional Data Platform for Real Estate Consultants</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <a href="tel:+916359806195" className="hover:text-white transition-colors">63598 06195</a>
                </div>
                <div className="flex items-center gap-2">
                  <span>✉️</span>
                  <a href="mailto:propertyhub1987@gmail.com" className="hover:text-white transition-colors">propertyhub1987@gmail.com</a>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <a href="https://www.instagram.com/propertyhub1987?igsh=Yjl2ZXpwNzMxNXVz" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors" aria-label="Instagram">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61579833831698&mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" aria-label="Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400 text-sm">© 2025 PropertyHub. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Request Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Request a Demo</h3>
              <button onClick={() => setShowDemoModal(false)} className="text-white/60 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {demoSuccess ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-white font-semibold text-lg mb-2">Request Submitted!</p>
                <p className="text-white/70 text-sm mb-6">We&apos;ll get in touch with you shortly.</p>
                <button onClick={() => setShowDemoModal(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={demoName}
                    onChange={e => setDemoName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={demoMobile}
                    onChange={e => setDemoMobile(e.target.value)}
                    placeholder="Your mobile number"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {demoError && (
                  <p className="text-red-400 text-sm">{demoError}</p>
                )}
                <button
                  type="submit"
                  disabled={demoLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold transition-all duration-200"
                >
                  {demoLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
