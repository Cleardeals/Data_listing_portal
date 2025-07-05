'use client';

import { FaPlus, FaTrash, FaSearch, FaEdit } from "react-icons/fa";
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchExternalUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users. Please try again.';
        setError(errorMessage);
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
        setError(null);
        await deleteExternalUser(selectedUser.id);
        setUsers(users.filter(user => user.id !== selectedUser.id));
        setSuccess('User deleted successfully');
      } catch (error) {
        console.error('Failed to delete user:', error);
        setError('Failed to delete user. Please try again.');
      }
    }
    setShowDeleteConfirm(false);
    setSelectedUser(null);
  };
  
  // Handle search filtering
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.business.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handle adding a new user
  const handleAddUser = async (userData: ExternalUserFormData) => {
    try {
      setError(null);
      const newUser = await addExternalUser(userData);
      setUsers([...users, newUser]);
      setShowAddUser(false);
      setSuccess('User added successfully');
    } catch (error) {
      console.error('Failed to add user:', error);
      setError('Failed to add user. Please try again.');
    }
  };
  
  // Handle updating an existing user
  const handleUpdateUser = async (userData: ExternalUserFormData) => {
    if (selectedUser) {
      try {
        setError(null);
        const updatedUser = await updateExternalUser(selectedUser.id, userData);
        setUsers(users.map(user => user.id === selectedUser.id ? updatedUser : user));
        setShowEditUser(false);
        setSelectedUser(null);
        setSuccess('User updated successfully');
      } catch (error) {
        console.error('Failed to update user:', error);
        setError('Failed to update user. Please try again.');
      }
    }
  };
  
  // Handle verification status change
  const handleVerificationChange = async (userId: string, verify: boolean) => {
    setUpdatingVerification(userId);
    try {
      setError(null);
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
      setSuccess(`User ${verify ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Failed to update verification status:', error);
      setError('Failed to update verification status. Please try again.');
    } finally {
      setUpdatingVerification(null);
    }
  };
  
  return (
    <div className="p-8">
      {/* Success/Error Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {/* Search and Action Bar */}
      <div className="flex items-center mb-4 border-2 border-blue-400 rounded-lg w-full max-w-3xl mx-auto bg-white px-2 py-1">
        <input 
          className="flex-1 px-4 py-2 rounded-l-full focus:outline-none placeholder-gray-800 bg-white text-black" 
          placeholder="Search by name, email, business, or role" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="flex items-center justify-center w-10 h-10"><FaSearch className="text-black text-lg" /></button>    
        <div className="flex items-center space-x-2 ml-2">
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
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="border px-2 py-8 text-gray-500">
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="bg-white text-gray-800 hover:bg-gray-50">
                    <td className="border px-2 py-1">{index + 1}</td>
                    <td className="border px-2 py-1 font-medium">{user.name}</td>
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
                        className="text-blue-500 text-xl mx-auto hover:text-blue-700 transition-colors" 
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditConfirm(true);
                        }} 
                      />
                    </td>
                    <td className="border px-2 py-1 text-red-600 cursor-pointer">
                      <FaTrash 
                        className="text-red-500 text-xl mx-auto hover:text-red-700 transition-colors" 
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteConfirm(true);
                        }} 
                      />
                    </td>
                  </tr>
                ))
              )}
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