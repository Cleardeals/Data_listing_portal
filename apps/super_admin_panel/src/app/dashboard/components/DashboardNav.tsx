'use client';
import React from 'react';

interface DashboardNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardNav: React.FC<DashboardNavProps> = ({ activeTab, setActiveTab }) => (
  <nav className="dashboard-nav flex justify-center space-x-4 my-6">
    <button
      className={`px-6 py-2 rounded-full font-medium focus:outline-none ${activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-black'}`}
      onClick={() => setActiveTab('dashboard')}
    >
      Dashboard
    </button>
    <button
      className={`px-6 py-2 rounded-full font-medium focus:outline-none ${activeTab === 'generalUser' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-black'}`}
      onClick={() => setActiveTab('generalUser')}
    >
      General User
    </button>
    <button
      className={`px-6 py-2 rounded-full font-medium focus:outline-none ${activeTab === 'internalUser' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-black'}`}
      onClick={() => setActiveTab('internalUser')}
    >
      Internal User
    </button>
  </nav>
);

export default DashboardNav; 