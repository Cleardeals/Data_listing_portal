"use client";
import { useState, useEffect, ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoginPage from '../../app/login/page';
import logo from './image.png';

export default function HomeContent(): ReactElement {
  const [showLogin, setShowLogin] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const slideImages: string[] = [
    '/property-analytics.jpg',  // The image shown with business charts/graphs
    'https://tse1.mm.bing.net/th?id=OIP.g1ZZ89Jx7VKsCg0Jjc31UQHaG5&pid=Api&rs=1&c=1&qlt=95&w=132&h=123',
    '/digital-property-interface.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev: number) => (prev + 1) % slideImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slideImages.length]);

  const handleGoToSlide = (index: number): void => setCurrentSlide(index);
  const nextSlide = (): void => setCurrentSlide((currentSlide + 1) % slideImages.length);
  const prevSlide = (): void => setCurrentSlide((currentSlide - 1 + slideImages.length) % slideImages.length);

  return (
    <>
      {showLogin ? (
        <LoginPage />
      ) : (
        <>
          {/* Top Bar */}
          <div className="bg-gray-900 text-white px-5 py-2 flex justify-between items-center">
            <div className="flex gap-4">
              <button onClick={() => setShowLogin(true)} className="flex items-center gap-1">
                <span>🔒</span> Sign in
              </button>
            </div>
            <Link href="tel:9625252585" className="flex items-center">
              📞 Call Us: 9625252585, 7046327742
            </Link>
          </div>

          {/* Navbar */}
          <nav className="flex justify-between items-center bg-white px-5 py-4 shadow-md">
            <Link href="/" className="flex items-center">
              <Image src={logo} width={200} height={60} alt=""/>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-blue-500 font-medium">HOME</Link>
              <div className="relative group">
                <span className="cursor-pointer">ABOUT US ▼</span>
                <div className="absolute hidden group-hover:block bg-white shadow-lg mt-1 z-10">
                  <Link href="/about/benefits" className="block px-4 py-2 hover:bg-gray-100">Benefits</Link>
                  <Link href="/about/Faq" className="block px-4 py-2 hover:bg-gray-100">Faq</Link>
                </div>
              </div>
              <div className="relative group">
                <span className="cursor-pointer">HOW IT WORKS ▼</span>
                <div className="absolute hidden group-hover:block bg-white shadow-lg mt-1 z-10">
                  <Link href="/Functions" className="block px-4 py-2 hover:bg-gray-100">Functions</Link>
                </div>
              </div>
              <Link href="/services">SERVICES</Link>
              <Link href="/post-property">POST PROPERTY</Link>
              <Link href="/contact">CONTACT US</Link>
            </div>
          </nav>

          {/* Hero Carousel */}
          <div className="relative w-full h-[500px] overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentSlide * 100}%)`, width: `${slideImages.length * 100}%` }}>
              {slideImages.map((src: string, i: number) => (
                <div className="w-full flex-shrink-0 h-[500px] relative" key={i}>
                  <Image src={src} alt={`Slide ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>

            {/* Arrows */}
            <button onClick={prevSlide} className="absolute top-1/2 left-5 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full">&#10094;</button>
            <button onClick={nextSlide} className="absolute top-1/2 right-5 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full">&#10095;</button>

            {/* Indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {slideImages.map((_: string, i: number) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full cursor-pointer ${i === currentSlide ? 'bg-blue-500' : 'bg-gray-400'}`}
                  onClick={() => handleGoToSlide(i)}
                ></div>
              ))}
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center my-8 px-4">
            <h1 className="text-3xl text-blue-800 font-bold">Clear Deals Solutions</h1>
            <p className="text-lg text-blue-600 mt-2">Lets Work with Technology</p>
            <p className="text-gray-700 mt-4">
              Clear Deals Property is a modern real estate platform designed to simplify property transactions.
            </p>
            <h2>It offers users a seamless experience for buying, selling, and renting properties</h2> 
            <h2>with features like verified listings, advanced search filters, custom login, and secure authentication</h2>
            
            <p className="text-gray-700 mt-2"> 
              Our platform streamlines property transactions with transparent processes and expert guidance.
            </p>
          </div>

          

          {/* Footer */}
          <footer className="bg-gray-800 text-white px-5 py-8">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div className="mb-6 md:mb-0">
                <h3 className="text-xl font-bold mb-3">Clear Deals</h3>
                <p>Lets Work with Technology</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Quick Links</h4>
                  <ul>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/about">About Us</Link></li>
                    <li><Link href="/services">Services</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Services</h4>
                  <ul>
                    <li><Link href="/buy">Buy Property</Link></li>
                    <li><Link href="/sell">Sell Property</Link></li>
                    <li><Link href="/rent">Rent Property</Link></li>
                  </ul>
                </div> 
                <div>
                  <h4 className="font-semibold mb-2">Contact</h4>
                  <p>📞 9625252585</p>
                  <p>📞 7046327745</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-4 flex flex-col md:flex-row justify-between items-center">
             
              <div className="mt-3 md:mt-0">
                <Link href="/terms" className="mr-4">Terms & Conditions</Link>
                <Link href="/privacy">Privacy Policy</Link>
              </div>
            </div>
          </footer>
        </>
      )}
    </>
  );
}