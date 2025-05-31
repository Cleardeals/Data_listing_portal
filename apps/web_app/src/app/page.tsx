"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev: number) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGoToSlide = (index: number): void => setCurrentSlide(index);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white px-6 py-3 flex justify-between items-center backdrop-blur-sm">
        <div className="flex gap-6">
          <Link href="/login" className="flex items-center gap-2 hover:text-blue-200 transition-colors duration-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Sign in
          </Link>
        </div>
        <Link href="tel:9625252585" className="flex items-center gap-2 hover:text-blue-200 transition-colors duration-200">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          Call Us: 9625252585, 7046327742
        </Link>
      </div>

      {/* Navbar */}
      <nav className="flex justify-between items-center bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <Link href="/" className="flex items-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            PropertyHub
          </div>
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200">HOME</Link>
          <div className="relative group">
            <span className="cursor-pointer text-slate-700 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1">
              ABOUT US 
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            <div className="absolute hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 z-10 border border-gray-100 overflow-hidden">
              <Link href="/about/benefits" className="block px-6 py-3 hover:bg-blue-50 transition-colors duration-200">Benefits</Link>
              <Link href="/about/faq" className="block px-6 py-3 hover:bg-blue-50 transition-colors duration-200">FAQ</Link>
            </div>
          </div>
          <div className="relative group">
            <span className="cursor-pointer text-slate-700 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1">
              HOW IT WORKS
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            <div className="absolute hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 z-10 border border-gray-100 overflow-hidden">
              <Link href="/how-it-works/functions" className="block px-6 py-3 hover:bg-blue-50 transition-colors duration-200">Functions</Link>
            </div>
          </div>
          <Link href="/services" className="text-slate-700 hover:text-blue-600 transition-colors duration-200">SERVICES</Link>
          <Link href="/post-property" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium shadow-md">POST PROPERTY</Link>
          <Link href="/contact" className="text-slate-700 hover:text-blue-600 transition-colors duration-200">CONTACT US</Link>
        </div>
      </nav>

      {/* Hero Section with 3D Animation */}
      <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-3xl transform rotate-45 float-animation"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-bounce animate-delay-200"></div>
          <div className="absolute bottom-40 left-1/4 w-28 h-28 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-2xl transform -rotate-12 float-animation animate-delay-300"></div>
          <div className="absolute bottom-60 right-1/3 w-20 h-20 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full animate-bounce animate-delay-500"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent grid-overlay">
          </div>
        </div>

        {/* Hero Content - Main Section */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
          {/* Main Hero Text */}
          <div className={`text-center text-white max-w-6xl px-6 mb-20 transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-gradient-animate">
                Everything Platform
              </span>
              <span className="block mt-4 bg-gradient-to-r from-emerald-200 via-blue-200 to-purple-200 bg-clip-text text-transparent">
                for your property needs
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-4xl mx-auto leading-relaxed opacity-90">
              PropertyHub provides amazing collaboration opportunities for buyers, sellers, and real estate professionals alike.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/search" className="group bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-10 py-5 rounded-2xl font-semibold text-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/25 btn-3d">
                <span className="flex items-center gap-3">
                  Explore Properties
                  <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </Link>
              <Link href="/post-property" className="bg-white/10 backdrop-blur-3d text-white px-10 py-5 rounded-2xl font-semibold text-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-2xl btn-3d">
                List Your Property
              </Link>
            </div>
          </div>

          {/* 3D Property Cards Animation - Bottom Section */}
          <div className="perspective-1000 w-full max-w-6xl mx-auto px-6">
            <div className="flex justify-center space-x-6 md:space-x-8">
              {[
                { 
                  title: "Modern Villa", 
                  price: "$2.5M", 
                  delay: "0s",
                  gradient: "from-blue-500 to-cyan-500",
                  icon: "🏡"
                },
                { 
                  title: "Luxury Apartment", 
                  price: "$850K", 
                  delay: "1s",
                  gradient: "from-purple-500 to-pink-500",
                  icon: "🏢"
                },
                { 
                  title: "Cozy Cottage", 
                  price: "$450K", 
                  delay: "2s",
                  gradient: "from-emerald-500 to-teal-500",
                  icon: "🏘️"
                }
              ].map((property, index) => (
                <div
                  key={index}
                  className={`property-card-3d transform transition-all duration-1000 ${
                    currentSlide === index ? 'scale-105 z-30' : 'scale-90 opacity-80'
                  }`}
                  style={{
                    animationDelay: property.delay,
                    transform: `rotateY(${currentSlide === index ? '0deg' : currentSlide > index ? '-10deg' : '10deg'}) translateZ(${currentSlide === index ? '20px' : '0px'})`
                  }}
                >
                  <div className={`bg-gradient-to-br ${property.gradient} p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-lg border border-white/20 min-h-64 w-60 md:w-72 flex flex-col justify-between transform transition-all duration-500 hover:scale-105`}>
                    <div className="text-center">
                      <div className="text-4xl md:text-5xl mb-3 animate-bounce">{property.icon}</div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">{property.title}</h3>
                      <p className="text-white/80 text-sm mb-3">Premium Location</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white mb-3">{property.price}</div>
                      <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold text-sm hover:bg-white/30 transition-all duration-200 transform hover:scale-105">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-30">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              onClick={() => handleGoToSlide(index)}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full text-blue-600 font-medium mb-6 border border-blue-100 shadow-sm">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Why Choose PropertyHub
            </div>
            <h2 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Unmatched Property
              <span className="block text-gradient-animate">
                Experience
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              PropertyHub provides amazing collaboration opportunities for buyers, sellers, and real estate professionals alike with cutting-edge technology and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Verified Listings",
                description: "Every property is thoroughly verified and authenticated before listing to ensure quality and reliability.",
                gradient: "from-emerald-500 to-teal-500",
                delay: "animate-delay-100"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                ),
                title: "Advanced Search",
                description: "Find your perfect property with powerful filters including location, price, amenities, and more.",
                gradient: "from-blue-500 to-cyan-500",
                delay: "animate-delay-200"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                ),
                title: "Secure Authentication",
                description: "Bank-level security with multi-factor authentication to protect your personal and financial data.",
                gradient: "from-purple-500 to-pink-500",
                delay: "animate-delay-300"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                ),
                title: "Market Analytics",
                description: "Access real-time market data, price trends, and investment insights to make informed decisions.",
                gradient: "from-orange-500 to-red-500",
                delay: "animate-delay-100"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                ),
                title: "24/7 Support",
                description: "Get instant help from our dedicated support team available around the clock for all your needs.",
                gradient: "from-indigo-500 to-blue-500",
                delay: "animate-delay-200"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                ),
                title: "Virtual Tours",
                description: "Experience properties from anywhere with immersive 360° virtual tours and detailed floor plans.",
                gradient: "from-teal-500 to-emerald-500",
                delay: "animate-delay-300"
              }
            ].map((feature, index) => (
              <div key={index} className={`card-hover-3d group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 ${feature.delay}`}>
                <div className="relative">
                  <div className={`bg-gradient-to-br ${feature.gradient} text-white w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 pulse-glow`}>
                    {feature.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-4 h-4 text-gray-400 m-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{feature.description}</p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-300">
                    Learn more
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Stats Section */}
          <div className="mt-20 bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-white/30 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { number: "50K+", label: "Properties Listed", icon: "🏠" },
                { number: "25K+", label: "Happy Customers", icon: "😊" },
                { number: "500+", label: "Expert Agents", icon: "👥" },
                { number: "100%", label: "Satisfaction Rate", icon: "⭐" }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                  <div className="text-4xl font-bold text-gray-900 mb-2 text-gradient-animate">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl float-animation animate-delay-300"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full text-purple-600 font-medium mb-6 border border-purple-100 shadow-sm">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Simple Process
            </div>
            <h2 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
              How PropertyHub
              <span className="block text-gradient-animate">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Streamline your property journey with our simple, secure, and efficient process designed for modern real estate transactions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
            {[
              {
                step: "01",
                title: "Search & Discover",
                description: "Browse thousands of verified properties with advanced AI-powered filters. Use our smart recommendations to find properties that match your exact needs and budget.",
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                ),
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50"
              },
              {
                step: "02",
                title: "Connect & Communicate",
                description: "Directly connect with property owners and real estate professionals. Schedule virtual tours, ask questions, and negotiate terms seamlessly through our platform.",
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                ),
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-50 to-pink-50"
              },
              {
                step: "03",
                title: "Secure Transaction",
                description: "Complete your transaction with confidence using our secure payment system, legal document management, and expert guidance throughout the entire process.",
                icon: (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                ),
                gradient: "from-emerald-500 to-teal-500",
                bgGradient: "from-emerald-50 to-teal-50"
              }
            ].map((step, index) => (
              <div key={index} className="relative group">
                <div className={`card-hover-3d bg-gradient-to-br ${step.bgGradient} rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 backdrop-blur-sm`}>
                  {/* Step number background */}
                  <div className="absolute -top-6 -left-6 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-400">{step.step}</span>
                  </div>
                  
                  {/* Icon container */}
                  <div className={`bg-gradient-to-br ${step.gradient} text-white w-24 h-24 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 pulse-glow mt-6`}>
                    {step.icon}
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 mb-6 group-hover:text-blue-600 transition-colors duration-300">{step.title}</h3>
                  <p className="text-gray-700 leading-relaxed text-lg mb-8">{step.description}</p>
                  
                  {/* Action button */}
                  <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                    <span>Get Started</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Connection line for desktop */}
                {index < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                    <div className="w-12 h-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full"></div>
                    <div className="absolute -right-2 -top-2 w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Process Flow Visualization */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-white/30 shadow-xl">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Your Journey Timeline</h3>
              <p className="text-gray-600 text-lg">From search to ownership in record time</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { icon: "🔍", title: "Search", time: "Day 1" },
                { icon: "❤️", title: "Shortlist", time: "Day 2-3" },
                { icon: "🏠", title: "Visit", time: "Day 4-7" },
                { icon: "📝", title: "Apply", time: "Day 8-10" },
                { icon: "🎉", title: "Move In", time: "Day 15" }
              ].map((phase, index) => (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">{phase.icon}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{phase.title}</h4>
                  <p className="text-blue-600 text-sm font-medium">{phase.time}</p>
                  {index < 4 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl float-animation"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl float-animation animate-delay-300"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl animate-pulse"></div>
          
          {/* Grid overlay */}
          <div className="absolute inset-0 grid-overlay opacity-30"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center px-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-3d px-6 py-3 rounded-full text-blue-200 font-medium mb-8 border border-white/20">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Ready to Get Started?
          </div>
          
          {/* Main heading */}
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Join the Future of
            <span className="block text-gradient-animate">Real Estate</span>
          </h2>
          
          {/* Description */}
          <p className="text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Unlock the future of property transactions with PropertyHub. 
            <span className="block mt-2 text-xl text-blue-200">
              Remember, this journey is just getting started.
            </span>
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/search" className="group bg-white text-blue-900 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl btn-3d">
              <span className="flex items-center gap-3">
                Start Exploring
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
            <Link href="/contact" className="bg-white/10 backdrop-blur-3d text-white px-10 py-5 rounded-2xl font-bold text-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 btn-3d">
              Contact Us
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            {[
              { 
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ),
                text: "Verified Properties",
                subtext: "100% Authentic"
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                ),
                text: "Secure Transactions",
                subtext: "Bank-level Security"
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                ),
                text: "24/7 Support",
                subtext: "Always Available"
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ),
                text: "No Hidden Fees",
                subtext: "Transparent Pricing"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors duration-300 group-hover:scale-110 transform">
                  <div className="text-blue-300 group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h4 className="font-bold text-white mb-1">{feature.text}</h4>
                <p className="text-blue-200 text-sm">{feature.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-2xl shadow-lg w-fit mb-8 hover:scale-105 transition-transform duration-300">
                PropertyHub
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 text-lg">
                Transforming real estate with cutting-edge technology and exceptional service. Your trusted partner in property transactions.
              </p>
              <div className="flex gap-4">
                {[
                  { 
                    icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    ),
                    href: "#",
                    name: "Twitter"
                  },
                  { 
                    icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    ),
                    href: "#",
                    name: "LinkedIn"
                  },
                  { 
                    icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.142.662-1.995 1.482-1.995.699 0 1.037.219 1.037 1.037 0 .631-.399 1.578-.6 2.455-.219.937.469 1.578 1.406 1.578 1.687 0 2.984-1.781 2.984-4.348 0-2.271-1.626-3.864-3.954-3.864-2.699 0-4.287 2.018-4.287 4.105 0 .813.314 1.687.705 2.161.077.094.088.178.065.274-.07.297-.226 1.141-.257 1.301-.041.188-.134.228-.309.137-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.968-.525-2.29-1.226l-.623 2.37c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.012.001z"/>
                      </svg>
                    ),
                    href: "#",
                    name: "Pinterest"
                  },
                  { 
                    icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    ),
                    href: "#",
                    name: "YouTube"
                  }
                ].map((social) => (
                  <Link key={social.name} href={social.href} className="bg-gray-800 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-110 group">
                    <div className="text-gray-400 group-hover:text-white transition-colors duration-300">
                      {social.icon}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-8 text-white">Quick Links</h4>
              <ul className="space-y-4">
                {[
                  { name: "Home", href: "/" },
                  { name: "About Us", href: "/about" },
                  { name: "Services", href: "/services" },
                  { name: "Contact", href: "/contact" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                      <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-8 text-white">Services</h4>
              <ul className="space-y-4">
                {[
                  { name: "Buy Property", href: "/search?type=buy" },
                  { name: "Sell Property", href: "/post-property" },
                  { name: "Rent Property", href: "/search?type=rent" },
                  { name: "Property Management", href: "/services/management" }
                ].map((service) => (
                  <li key={service.name}>
                    <Link href={service.href} className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                      <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-8 text-white">Contact Info</h4>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 p-3 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Call Us</p>
                    <p className="text-gray-400">9625252585</p>
                    <p className="text-gray-400">7046327745</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-600 p-3 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Email Us</p>
                    <p className="text-gray-400">hello@propertyhub.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-6 md:mb-0 text-lg">
              © 2025 PropertyHub. All rights reserved.
            </p>
            <div className="flex gap-8">
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200 hover:underline">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
