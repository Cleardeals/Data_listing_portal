"use client";

import React from 'react';

function PageHeader() {
  return (
    <div className="text-center mb-4 sm:mb-6 lg:mb-8 px-3 sm:px-0">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-animate mb-2 sm:mb-3">
        🔍 Property Database Explorer
      </h1>
      <p className="text-white/70 text-sm sm:text-sm md:text-base mb-3 sm:mb-4 max-w-xs sm:max-w-lg lg:max-w-3xl mx-auto px-2 sm:px-0">
        Discover your perfect property with advanced filters and real-time data insights
      </p>
    </div>
  );
};

export default PageHeader;
