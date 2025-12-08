"use client";

import React from 'react';

function BackgroundElements() {
  return (
    <>
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="float-animation absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-sm"></div>
        <div className="float-animation absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
        <div className="float-animation absolute bottom-40 left-40 w-28 h-28 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="grid-overlay absolute inset-0 opacity-10"></div>
    </>
  );
};

export default BackgroundElements;
