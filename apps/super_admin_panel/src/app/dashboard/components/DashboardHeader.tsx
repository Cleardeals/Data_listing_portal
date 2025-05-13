import React, { useState } from 'react';
import { MdAddCall } from 'react-icons/md';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import ProfileModal from './ProfileModal';

const DashboardHeader = () => {
  const [showProfile, setShowProfile] = useState(false);
  return (
    <>
      <header className="dashboard-header flex justify-between items-center py-4 px-8 border-b">
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
};

export default DashboardHeader; 