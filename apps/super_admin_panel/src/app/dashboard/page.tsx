'use client';

import { FaBell, FaUserCircle, FaPlus, FaFilter, FaImages, FaTrash, FaWrench, FaSearch, FaEdit } from "react-icons/fa";
import { useState } from 'react';
import DashboardCharts from './components/DashboardCharts';
import DashboardHeader from './components/DashboardHeader';
import DashboardNav from './components/DashboardNav';
import AddEditUserModal from './components/adduser';
import { EditConfirmationModal } from './components/editConfirmationModal';
import { DeleteConfirmationModal } from './components/deleteConfirmationModal';

function GeneralUserTable() {
  // Mock data for demonstration
  const users = Array.from({ length: 10 }, (_, i) => ({
    no: 1,
    name: 'Sam',
    email: 'Sam@gmail.com',
    business: 'Business',
    contact: '1234567890',
    subscription: 'Subscription',
  }));
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [businessValues, setBusinessValues] = useState(Array(users.length).fill('testbusiness1'));
  const [subscriptionValues, setSubscriptionValues] = useState(Array(users.length).fill('testsubscription1'));
  return (
    <div className="p-8">      
      <div className="flex items-center mb-4 border-2 border-blue-400 rounded-lg w-full max-w-3xl mx-auto bg-white px-2 py-1">
        <input className="flex-1 px-4 py-2 rounded-l-full focus:outline-none placeholder-gray-800 bg-white" placeholder="Search" />
        <button className="flex items-center justify-center w-10 h-10"><FaSearch className="text-black text-lg" /></button>
        <div className="flex items-center space-x-2 ml-2">
          <button className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-400 bg-blue-100 hover:bg-blue-200 transition"><FaFilter className="text-blue-700 text-lg" /></button>
          <button onClick={() => setShowAddUser(true)} className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-400 bg-blue-100 hover:bg-blue-200 transition"><FaPlus className="text-blue-700 text-lg" /></button>
        </div>
      </div>
      <AddEditUserModal open={showAddUser} onClose={() => setShowAddUser(false)} mode="add" />
      <div className="overflow-x-auto">
        <table className="min-w-full border text-center">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-2 py-1 border text-blue-900 font-bold">NO</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">NAME</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">Email</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">Business</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">Contact</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">Subscription</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">Edit</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx} className="bg-white text-gray-800">
                <td className="border px-2 py-1">{user.no}</td>
                <td className="border px-2 py-1">{user.name}</td>
                <td className="border px-2 py-1">{user.email}</td>
                <td className="border px-2 py-1">
                  <select
                    className="w-full border rounded px-1 py-1 text-black bg-white"
                    value={businessValues[idx]}
                    onChange={e => {
                      const newVals = [...businessValues];
                      newVals[idx] = e.target.value;
                      setBusinessValues(newVals);
                    }}
                  >
                    <option value="testbusiness1">testbusiness1</option>
                    <option value="testbusiness2">testbusiness2</option>
                    <option value="testbusiness3">testbusiness3</option>
                  </select>
                </td>
                <td className="border px-2 py-1">{user.contact}</td>
                <td className="border px-2 py-1">
                  <select
                    className="w-full border rounded px-1 py-1 text-black bg-white"
                    value={subscriptionValues[idx]}
                    onChange={e => {
                      const newVals = [...subscriptionValues];
                      newVals[idx] = e.target.value;
                      setSubscriptionValues(newVals);
                    }}
                  >
                    <option value="testsubscription1">testsubscription1</option>
                    <option value="testsubscription2">testsubscription2</option>
                  </select>
                </td>
                <td className="border px-2 py-1 text-blue-600 cursor-pointer"><FaEdit className="text-blue-500 text-xl mx-auto" onClick={() => { setShowEditUser(true); }} /></td>
                <td className="border px-2 py-1 text-red-600 cursor-pointer"><FaTrash className="text-red-500 text-xl mx-auto" onClick={() => setShowDeleteConfirm(true)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <EditConfirmationModal isOpen={showEditUser} onConfirm={() => { setShowEditUser(false); }} onClose={() => setShowEditUser(false)} />
      <AddEditUserModal open={showEditUser} onClose={() => setShowEditUser(false)} mode="edit" />
      <DeleteConfirmationModal isOpen={showDeleteConfirm} onConfirm={() => setShowDeleteConfirm(false)} onClose={() => setShowDeleteConfirm(false)} />
    </div>
  );
}

function InternalUserTable() {
  // Mock data for demonstration
  const users = Array.from({ length: 10 }, (_, i) => ({
    no: 1,
    name: 'Sam',
    email: 'Sam@gmail.com',
    role: 'Role ▼',
    contact: '1234567890',
    permission: 'Permission ▼',
  }));
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  return (
    <div className="p-8">    
      <div className="flex items-center mb-4 border-2 border-blue-400 rounded-lg w-full max-w-3xl mx-auto bg-white px-2 py-1">
        <input className="flex-1 px-4 py-2 rounded-l-full focus:outline-none placeholder-gray-800 bg-white" placeholder="Search" />
        <button className="flex items-center justify-center w-10 h-10"><FaSearch className="text-black text-lg" /></button>    
        <div className="flex items-center space-x-2 ml-2">
          <button className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-400 bg-blue-100 hover:bg-blue-200 transition"><FaFilter className="text-blue-700 text-lg" /></button>
          <button onClick={() => setShowAddUser(true)} className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-400 bg-blue-100 hover:bg-blue-200 transition"><FaPlus className="text-blue-700 text-lg" /></button>
        </div>
      </div>
      <AddEditUserModal open={showAddUser} onClose={() => setShowAddUser(false)} mode="add" />
      <div className="overflow-x-auto">
        <table className="min-w-full border text-center">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-2 py-1 border text-blue-900 font-bold">NO</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">NAME</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">Email</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">Role</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">Contact</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">Permission</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">Edit</th>
              <th className="px-2 py-1 border text-blue-900 font-bold">Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx} className="bg-white text-gray-800">
                <td className="border px-2 py-1">{user.no}</td>
                <td className="border px-2 py-1">{user.name}</td>
                <td className="border px-2 py-1">{user.email}</td>
                <td className="border px-2 py-1">{user.role}</td>
                <td className="border px-2 py-1">{user.contact}</td>
                <td className="border px-2 py-1">{user.permission}</td>
                <td className="border px-2 py-1 text-blue-600 cursor-pointer"><FaEdit className="text-blue-500 text-xl mx-auto" onClick={() => { setShowEditUser(true); }} /></td>
                <td className="border px-2 py-1 text-red-600 cursor-pointer"><FaTrash className="text-red-500 text-xl mx-auto" onClick={() => setShowDeleteConfirm(true)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <EditConfirmationModal isOpen={showEditUser} onConfirm={() => { setShowEditUser(false); }} onClose={() => setShowEditUser(false)} />
      <AddEditUserModal open={showEditUser} onClose={() => setShowEditUser(false)} mode="edit" />
      <DeleteConfirmationModal isOpen={showDeleteConfirm} onConfirm={() => setShowDeleteConfirm(false)} onClose={() => setShowDeleteConfirm(false)} />
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  return (
    <div className="dashboard-container min-h-screen bg-gray-50">
      <DashboardHeader />
      <DashboardNav activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'dashboard' && <DashboardCharts />}
      {activeTab === 'generalUser' && <GeneralUserTable />}
      {activeTab === 'internalUser' && <InternalUserTable />}
    </div>
  );
} 