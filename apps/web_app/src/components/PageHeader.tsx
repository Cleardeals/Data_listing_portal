"use client";

import React from 'react';

function PageHeader() {
  return (
    <div className="text-center mb-6 sm:mb-8 lg:mb-12 px-3 sm:px-0">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gradient-animate mb-3 sm:mb-4 lg:mb-6">
        🔍 Property Database Explorer
      </h1>
      <p className="text-white/70 text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 lg:mb-8 max-w-xs sm:max-w-lg lg:max-w-3xl mx-auto px-2 sm:px-0">
        Discover your perfect property with advanced filters and real-time data insights
      </p>
    </div>
  );
};

export default PageHeader;
