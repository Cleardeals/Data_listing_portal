'use client';

import { FaPlus, FaFilter, FaTrash, FaSearch, FaEdit } from "react-icons/fa";
import { useState, useEffect } from 'react';
import AddEditExternalUserModal from '../../components/addExternalUser';
import { EditConfirmationModal } from '../../components/editConfirmationModal';
import { DeleteConfirmationModal } from '../../components/deleteConfirmationModal';
import { 
  ExternalUser, 
  ExternalUserFormData, 
  fetchExternalUsers, 
  deleteExternalUser, 
  addExternalUser, 
  updateExternalUser, 
  verifyUser,
  unverifyUser
} from '../../lib/supabaseUsers';
import { supabase } from '../../lib/supabase';

export default function GeneralUserTable() {
  const [users, setUsers] = useState<ExternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExternalUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingVerification, setUpdatingVerification] = useState<string | null>(null);
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchExternalUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();

    // Setup real-time subscription for external users
    const subscription = supabase
      .channel('external_users_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'auth',
          table: 'users'
        },
        (payload: Record<string, unknown>) => {
          console.log('Real-time update received:', payload);
          
          // Refresh users list when auth.users table changes
          loadUsers();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Handle user deletion
  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      try {
        await deleteExternalUser(selectedUser.id);
        setUsers(users.filter(user => user.id !== selectedUser.id));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
    setShowDeleteConfirm(false);
  };
  
  // Handle search filtering
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle adding a new user
  const handleAddUser = async (userData: ExternalUserFormData) => {
    try {
      const newUser = await addExternalUser(userData);
      setUsers([...users, newUser]);
      setShowAddUser(false);
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };
  
  // Handle updating an existing user
  const handleUpdateUser = async (userData: ExternalUserFormData) => {
    if (selectedUser) {
      try {
        const updatedUser = await updateExternalUser(selectedUser.id, userData);
        setUsers(users.map(user => user.id === selectedUser.id ? updatedUser : user));
        setShowEditUser(false);
        setSelectedUser(null);
      } catch (error) {
        console.error('Failed to update user:', error);
      }
    }
  };
  
  // Handle verification status change
  const handleVerificationChange = async (userId: string, verify: boolean) => {
    setUpdatingVerification(userId);
    try {
      if (verify) {
        await verifyUser(userId);
      } else {
        await unverifyUser(userId);
      }
      setUsers(users.map(user => 
        user.id === userId ? { 
          ...user, 
          is_verified: verify, 
          role: verify ? 'Verified Customer' : 'Unverified Customer' 
        } : user
      ));
    } catch (error) {
      console.error('Failed to update verification status:', error);
    } finally {
      setUpdatingVerification(null);
    }
  };
  
  return (
    <div className="p-8">    
      <div className="flex items-center mb-4 border-2 border-blue-400 rounded-lg w-full max-w-3xl mx-auto bg-white px-2 py-1">
        <input 
          className="flex-1 px-4 py-2 rounded-l-full focus:outline-none placeholder-gray-800 bg-white text-black" 
          placeholder="Search" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="flex items-center justify-center w-10 h-10"><FaSearch className="text-black text-lg" /></button>    
        <div className="flex items-center space-x-2 ml-2">
          <button className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-400 bg-blue-100 hover:bg-blue-200 transition"><FaFilter className="text-blue-700 text-lg" /></button>
          <button onClick={() => setShowAddUser(true)} className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-400 bg-blue-100 hover:bg-blue-200 transition"><FaPlus className="text-blue-700 text-lg" /></button>
        </div>
      </div>
      <AddEditExternalUserModal 
        open={showAddUser} 
        onClose={() => setShowAddUser(false)} 
        mode="add" 
        onSave={handleAddUser}
      />
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <table className="min-w-full border text-center">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-2 py-1 border text-blue-900 font-bold">NO</th>
                <th className="px-2 py-1 border text-blue-900 font-bold">NAME</th>
                <th className="px-2 py-1 border text-blue-900 font-bold">Email</th>
                <th className="px-2 py-1 border text-blue-900 font-bold">Role</th>
                <th className="px-2 py-1 border text-blue-900 font-bold">Status</th>
                <th className="px-2 py-1 border text-blue-900 font-bold">Business</th>
                <th className="px-2 py-1 border text-blue-900 font-bold">Contact</th>
                <th className="px-2 py-1 border text-blue-900 font-bold">Verify</th>
                <th className="px-2 py-1 border text-blue-900 font-bold">Edit</th>
                <th className="px-2 py-1 border text-blue-900 font-bold">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="bg-white text-gray-800">
                  <td className="border px-2 py-1">{index + 1}</td>
                  <td className="border px-2 py-1">{user.name}</td>
                  <td className="border px-2 py-1">{user.email}</td>
                  <td className="border px-2 py-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'Verified Customer' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.role || 'Unverified Customer'}
                    </span>
                  </td>
                  <td className="border px-2 py-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.is_verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="border px-2 py-1">{user.business}</td>
                  <td className="border px-2 py-1">{user.contact}</td>
                  <td className="border px-2 py-1">
                    {updatingVerification === user.id ? (
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleVerificationChange(user.id, !user.is_verified)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          user.is_verified
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {user.is_verified ? 'Unverify' : 'Verify'}
                      </button>
                    )}
                  </td>
                  <td className="border px-2 py-1 text-blue-600 cursor-pointer">
                    <FaEdit 
                      className="text-blue-500 text-xl mx-auto" 
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditConfirm(true);
                      }} 
                    />
                  </td>
                  <td className="border px-2 py-1 text-red-600 cursor-pointer">
                    <FaTrash 
                      className="text-red-500 text-xl mx-auto" 
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteConfirm(true);
                      }} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Show EditConfirmationModal first, then open AddEditUserModal if confirmed */}
      <EditConfirmationModal 
        isOpen={showEditConfirm} 
        onConfirm={() => { 
          setShowEditConfirm(false);
          setShowEditUser(true);
        }} 
        onClose={() => {
          setShowEditConfirm(false);
          setSelectedUser(null);
        }} 
      />
      <AddEditExternalUserModal 
        open={showEditUser} 
        onClose={() => {
          setShowEditUser(false);
          setSelectedUser(null);
        }} 
        mode="edit" 
        userData={selectedUser}
        onSave={handleUpdateUser}
      />
      <DeleteConfirmationModal 
        isOpen={showDeleteConfirm} 
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedUser(null);
        }} 
      />
    </div>
  );
}