"use client";

import React from 'react';

const PageHeader: React.FC = () => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl lg:text-6xl font-bold text-gradient-animate mb-6">
        🔍 Property Database Explorer
      </h1>
      <p className="text-white/70 text-xl mb-8 max-w-3xl mx-auto">
        Discover your perfect property with advanced filters and real-time data insights
      </p>
    </div>
  );
};

export default PageHeader;
