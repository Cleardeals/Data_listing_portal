'use client';

import React, { useState, createContext, useContext } from 'react';
import { MdAddCall } from 'react-icons/md';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import ProfileModal from '../../components/ProfileModal';
import DashboardCharts from './DashboardCharts';
import GeneralUserTable from './generalUser';
import InternalUserTable from './internalUser';

// Create context for sharing the active tab state across components
interface DashboardContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardContext = createContext<DashboardContextType>({
  activeTab: 'dashboard',
  setActiveTab: () => {},
});

// Export hook for using the dashboard context in any component
export const useDashboardContext = () => useContext(DashboardContext);

// Header Component
function DashboardHeader() {
  const [showProfile, setShowProfile] = useState(false);
  return (
    <>
      <header className="dashboard-header flex justify-between items-center py-4 px-8 border-b bg-white shadow-sm">
        <div className="text-xl font-semibold text-blue-600">Super Admin Panel</div>
        <div className="flex items-center space-x-6">
          <button title="Add User" className="text-2xl"><MdAddCall className="text-blue-500" /></button>
          <button title="Notifications" className="text-2xl"><FaBell className="text-blue-500" /></button>
          <button title="Profile" className="text-2xl" onClick={() => setShowProfile(true)}><FaUserCircle className="text-blue-500" /></button>
        </div>
      </header>
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}

// Navigation Component
function DashboardNav() {
  const { activeTab, setActiveTab } = useDashboardContext();
  
  return (
    <nav className="dashboard-nav flex justify-center space-x-4 my-6 bg-gray-50 py-3">
      <button
        className={`px-6 py-2 rounded-full font-medium focus:outline-none transition-colors ${activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}
        onClick={() => setActiveTab('dashboard')}
      >
        Dashboard
      </button>
      <button
        className={`px-6 py-2 rounded-full font-medium focus:outline-none transition-colors ${activeTab === 'generalUser' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}
        onClick={() => setActiveTab('generalUser')}
      >
        General User
      </button>
      <button
        className={`px-6 py-2 rounded-full font-medium focus:outline-none transition-colors ${activeTab === 'internalUser' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}
        onClick={() => setActiveTab('internalUser')}
      >
        Internal User
      </button>
    </nav>
  );
}

// Dashboard content component
function DashboardContent() {
  const { activeTab } = useDashboardContext();
  
  return (
    <div className="dashboard-content px-8 py-6 bg-white">
      {activeTab === 'dashboard' && <DashboardCharts />}
      {activeTab === 'generalUser' && <GeneralUserTable />}
      {activeTab === 'internalUser' && <InternalUserTable />}
    </div>
  );
}

// Main Dashboard Page Component
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="dashboard-container min-h-screen bg-gray-50">
        <DashboardHeader />
        <DashboardNav />
        <main className="px-4">
          <DashboardContent />
        </main>
      </div>
    </DashboardContext.Provider>
  );
}