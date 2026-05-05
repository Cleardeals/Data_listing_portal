'use client'

import React, { useState, useEffect } from 'react'
import { MdAddCall } from 'react-icons/md'
import { FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardContext, useDashboardContext } from '@/contexts/DashboardContext'
import ProfileModal from '../../components/ProfileModal'
import { supabase } from '@/lib/supabase'
// Removed DashboardCharts import
import GeneralUserTable from './generalUser'
import InternalUserTable from './internalUser'

interface DemoRequest {
  id: string;
  name: string;
  mobile: string;
  created_at: string;
}

function DemoRequestsTable() {
  const [requests, setRequests] = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('demo_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRequests(data || [])
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="text-center text-gray-500 py-12">Loading...</p>

  if (requests.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-4xl mb-3">📭</div>
      <p className="font-medium">No demo requests yet.</p>
    </div>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-blue-50 text-left">
            <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">#</th>
            <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Name</th>
            <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Mobile</th>
            <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, i) => (
            <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
              <td className="px-4 py-3 font-semibold text-gray-800">{req.name}</td>
              <td className="px-4 py-3 text-blue-600 font-medium">{req.mobile}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(req.created_at).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Header Component
function DashboardHeader() {
  const [showProfile, setShowProfile] = useState(false)
  const { logout, session } = useAuth()

  const handleLogout = async () => {
    await logout()
    // Don't manually redirect - let auth state change handle it
  }

  return (
    <>
      <header className="dashboard-header flex justify-between items-center py-4 px-8 border-b bg-white shadow-sm">
        <div className="text-xl font-semibold text-blue-600">Super Admin Panel</div>
        <div className="flex items-center space-x-6">
          {session && (
            <div className="text-sm text-gray-600">
              Welcome, {session.user.email}
            </div>
          )}
          <button title="Add User" className="text-2xl"><MdAddCall className="text-blue-500" /></button>
          <button title="Notifications" className="text-2xl"><FaBell className="text-blue-500" /></button>
          <button title="Profile" className="text-2xl" onClick={() => setShowProfile(true)}><FaUserCircle className="text-blue-500" /></button>
          <button 
            title="Logout" 
            className="text-2xl text-red-500 hover:text-red-700 transition-colors" 
            onClick={handleLogout}
          >
            <FaSignOutAlt />
          </button>
        </div>
      </header>
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  )
}

// Navigation Component
function DashboardNav() {
  const { activeTab, setActiveTab } = useDashboardContext()
  
  return (
    <nav className="dashboard-nav flex justify-center space-x-4 my-6 bg-gray-50 py-3">
      {/* Removed Dashboard tab button */}
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
      <button
        className={`px-6 py-2 rounded-full font-medium focus:outline-none transition-colors ${activeTab === 'demoRequests' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}
        onClick={() => setActiveTab('demoRequests')}
      >
        Demo Requests
      </button>
    </nav>
  )
}

// Dashboard content component
function DashboardContent() {
  const { activeTab } = useDashboardContext()
  
  return (
    <div className="dashboard-content px-8 py-6 bg-white">
      {activeTab === 'generalUser' && <GeneralUserTable />}
      {activeTab === 'internalUser' && <InternalUserTable />}
      {activeTab === 'demoRequests' && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">📋 Demo Requests</h2>
          <DemoRequestsTable />
        </div>
      )}
    </div>
  )
}

// Main Dashboard Page Component
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('generalUser') // Default to generalUser
  
  return (
    <ProtectedRoute requiredRole="super_admin">
      <DashboardContext.Provider value={{ activeTab, setActiveTab }}>
        <div className="dashboard-container min-h-screen bg-gray-50">
          <DashboardHeader />
          <DashboardNav />
          <main className="px-4">
            <DashboardContent />
          </main>
        </div>
      </DashboardContext.Provider>
    </ProtectedRoute>
  )
}