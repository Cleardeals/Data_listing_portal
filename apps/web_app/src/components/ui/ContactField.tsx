"use client";

import React from 'react';

interface ContactFieldProps {
  contact: string | null | undefined;
  propertyId: string;
  isVisible: boolean;
  onToggle: (propertyId: string) => void;
  className?: string;
  iconClassName?: string;
  showIcon?: boolean;
}

const ContactField: React.FC<ContactFieldProps> = ({
  contact,
  propertyId,
  isVisible,
  onToggle,
  className = "",
  iconClassName = "",
  showIcon = true,
}) => {
  if (!contact || contact === 'N/A') {
    return (
      <span className={`text-white/40 ${className}`}>
        {showIcon && <span className={`mr-1 ${iconClassName}`}>📞</span>}
        N/A
      </span>
    );
  }

  const handleClick = () => {
    onToggle(propertyId);
  };

  return (
    <div 
      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${className}`}
      onClick={handleClick}
      title={isVisible ? "Click to hide contact" : "Click to reveal contact"}
    >
      {showIcon && <span className={`mr-1 ${iconClassName}`}>📞</span>}
      {isVisible ? (
        <span className="text-cyan-400 font-medium select-text">
          {contact}
        </span>
      ) : (
        <span className="text-white/60 bg-white/10 px-2 py-0.5 rounded border border-white/20 hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all text-xs">
          🔒 Reveal
        </span>
      )}
    </div>
  );
};

export default ContactField;
