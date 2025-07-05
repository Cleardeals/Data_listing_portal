'use client';

import { FaPlus, FaTrash, FaSearch, FaEdit, FaChevronDown } from "react-icons/fa";
import { useState, useEffect, useRef } from 'react';
import AddEditInternalUserModal from '../../components/addInternalUser';
import { EditConfirmationModal } from '../../components/editConfirmationModal';
import { DeleteConfirmationModal } from '../../components/deleteConfirmationModal';
import { 
  InternalUser, 
  InternalUserFormData, 
  availableRoles,
  fetchInternalUsers,
  addInternalUser,
  updateInternalUser,
  deleteInternalUser,
  updateInternalUserRole
} from '../../lib/supabaseUsers';

export default function InternalUserTable() {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setError(null);
        setLoading(true);
        const internalUsers = await fetchInternalUsers();
        setUsers(internalUsers);
      } catch (error) {
        console.error('Failed to fetch internal users:', error);
        setError(error instanceof Error ? error.message : 'Failed to load internal users');
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownIndex(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Handle save function for the UserFormData that AddEditUserModal provides
  const handleSaveUser = async (formData: InternalUserFormData) => {
    try {
      if (showEditUser && selectedUser) {
        // Update existing user
        const updatedUser = await updateInternalUser(selectedUser.id, formData);
        setUsers(users.map(user => user.id === selectedUser.id ? updatedUser : user));
        setShowEditUser(false);
      } else if (showAddUser) {
        // Add new user
        const newUser = await addInternalUser(formData);
        setUsers([...users, newUser]);
        setShowAddUser(false);
      }
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to save user:', error);
      // TODO: You might want to show an error message to the user here
      alert('Failed to save user. Please try again.');
    }
  };
  
  const handleEditClick = (user: InternalUser) => {
    setSelectedUser(user);
    setShowEditConfirm(true);
  };
  
  const handleDeleteClick = (user: InternalUser) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const toggleDropdown = (index: number) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateInternalUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setOpenDropdownIndex(null);
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      try {
        await deleteInternalUser(selectedUser.id);
        setUsers(users.filter(user => user.id !== selectedUser.id));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
    setShowDeleteConfirm(false);
    setSelectedUser(null);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
          <button onClick={() => setShowAddUser(true)} className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-400 bg-blue-100 hover:bg-blue-200 transition"><FaPlus className="text-blue-700 text-lg" /></button>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-3xl mx-auto">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <AddEditInternalUserModal 
        open={showAddUser} 
        onClose={() => setShowAddUser(false)} 
        onSave={handleSaveUser}
        mode="add" 
      />
      <div className="flex justify-center">
        <div className="overflow-x-auto w-full max-w-6xl">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <table className="w-full border text-center rounded-lg shadow-md border-collapse">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-2 border text-blue-900 font-bold w-16">NO</th>
                  <th className="px-4 py-2 border text-blue-900 font-bold w-48">NAME</th>
                  <th className="px-4 py-2 border text-blue-900 font-bold w-72">Email</th>
                  <th className="px-4 py-2 border text-blue-900 font-bold w-40">Role</th>
                  <th className="px-4 py-2 border text-blue-900 font-bold w-32">Status</th>
                  <th className="px-4 py-2 border text-blue-900 font-bold w-48">Contact</th>
                  <th className="px-4 py-2 border text-blue-900 font-bold w-16">Edit</th>
                  <th className="px-4 py-2 border text-blue-900 font-bold w-16">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id} className="bg-white text-gray-800 hover:bg-blue-50 transition-colors duration-150">
                    <td className="border px-4 py-2">{idx + 1}</td>
                    <td className="border px-4 py-2 text-left">{user.name}</td>
                    <td className="border px-4 py-2 text-left">{user.email}</td>
                    <td className="border px-4 py-2 relative">
                      <div 
                        className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-md text-blue-700 inline-flex items-center justify-between w-32 cursor-pointer hover:shadow-sm transition-all duration-200 border border-blue-200"
                        onClick={() => toggleDropdown(idx)}
                      >
                        <span className="font-medium">
                          {user.role === 'super_admin' ? 'Super Admin' : 
                           user.role === 'data_operator' ? 'Data Operator' : user.role}
                        </span>
                        <div className={`p-1 rounded-full bg-blue-200 bg-opacity-50 transition-transform duration-200 ${openDropdownIndex === idx ? 'rotate-180' : ''}`}>
                          <FaChevronDown className="text-blue-600" size={10} />
                        </div>
                      </div>
                      
                      {openDropdownIndex === idx && (
                        <div 
                          ref={dropdownRef}
                          className="absolute z-10 mt-1 w-36 bg-white border border-blue-200 rounded-md shadow-lg py-1 animate-fadeIn"
                          style={{
                            left: '50%',
                            transform: 'translateX(-50%)'
                          }}
                        >
                          {availableRoles.map((role) => (
                            <div 
                              key={role} 
                              className={`px-4 py-2 text-left hover:bg-blue-50 cursor-pointer transition-colors duration-150 ${
                                role === user.role ? 'bg-blue-100 text-blue-800 font-medium border-l-4 border-blue-500' : 'text-gray-700 border-l-4 border-transparent'
                              }`}
                              onClick={() => handleRoleChange(user.id, role)}
                            >
                              {role === 'super_admin' ? 'Super Admin' : 
                               role === 'data_operator' ? 'Data Operator' : role}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="border px-4 py-2">{user.contact}</td>
                    <td className="border px-4 py-2 text-blue-600 cursor-pointer">
                      <FaEdit 
                        className="text-blue-500 text-xl mx-auto hover:text-blue-700 transition-colors duration-200" 
                        onClick={() => handleEditClick(user)} 
                      />
                    </td>
                    <td className="border px-4 py-2 text-red-600 cursor-pointer">
                      <FaTrash 
                        className="text-red-500 text-xl mx-auto hover:text-red-700 transition-colors duration-200" 
                        onClick={() => handleDeleteClick(user)} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Show EditConfirmationModal first, then open AddEditUserModal if confirmed */}
      <EditConfirmationModal 
        isOpen={showEditConfirm} 
        onConfirm={() => { 
          setShowEditConfirm(false);
          setShowEditUser(true);
        }} 
        onClose={() => setShowEditConfirm(false)} 
      />
      <AddEditInternalUserModal 
        open={showEditUser} 
        onClose={() => setShowEditUser(false)}
        onSave={handleSaveUser}
        mode="edit"
        userData={selectedUser}
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