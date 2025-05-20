'use client';

import { FaPlus, FaFilter, FaTrash, FaSearch, FaEdit, FaChevronDown } from "react-icons/fa";
import { useState, useEffect, useRef } from 'react';
import AddEditInternalUserModal from '../../components/addInternalUser';
import { EditConfirmationModal } from '../../components/editConfirmationModal';
import { DeleteConfirmationModal } from '../../components/deleteConfirmationModal';
import { TableUser, UserFormData, getInternalUsers, availableRoles } from '../../lib/internalUsers';

export default function InternalUserTable() {
  const [users, setUsers] = useState<TableUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<TableUser | null>(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Fetch data from the lib file
    const internalUsers = getInternalUsers();
    setUsers(internalUsers);
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
  const handleSaveUser = (formData: UserFormData) => {
    // Here you would typically save the user data to your backend
    console.log('Saving form data:', formData);
    // Close the modal after saving
    setShowAddUser(false);
    setShowEditUser(false);
  };
  
  const handleEditClick = (user: TableUser) => {
    setSelectedUser(user);
    setShowEditConfirm(true);
  };
  
  const handleDeleteClick = (user: TableUser) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const toggleDropdown = (index: number) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  const handleRoleChange = (userIndex: number, newRole: string) => {
    const updatedUsers = users.map((user, idx) => 
      idx === userIndex ? { ...user, role: newRole } : user
    );
    setUsers(updatedUsers);
    setOpenDropdownIndex(null);
    
    // In a real app, you would save this change to the backend
    console.log(`Changed role for user ${users[userIndex].name} to ${newRole}`);
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      // Filter out the selected user from the users array
      const updatedUsers = users.filter(user => user.no !== selectedUser.no);
      setUsers(updatedUsers);
      
      // In a real app, you would also delete from the backend
      console.log(`Deleted user ${selectedUser.name}`);
    }
    setShowDeleteConfirm(false);
  };
  
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
      <AddEditInternalUserModal 
        open={showAddUser} 
        onClose={() => setShowAddUser(false)} 
        onSave={handleSaveUser}
        mode="add" 
      />
      <div className="flex justify-center">
        <div className="overflow-x-auto w-full max-w-6xl">
          <table className="w-full border text-center rounded-lg shadow-md border-collapse">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 border text-blue-900 font-bold w-16">NO</th>
                <th className="px-4 py-2 border text-blue-900 font-bold w-48">NAME</th>
                <th className="px-4 py-2 border text-blue-900 font-bold w-72">Email</th>
                <th className="px-4 py-2 border text-blue-900 font-bold w-40">Role</th>
                <th className="px-4 py-2 border text-blue-900 font-bold w-48">Contact</th>
                <th className="px-4 py-2 border text-blue-900 font-bold w-16">Edit</th>
                <th className="px-4 py-2 border text-blue-900 font-bold w-16">Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={idx} className="bg-white text-gray-800 hover:bg-blue-50 transition-colors duration-150">
                  <td className="border px-4 py-2">{user.no}</td>
                  <td className="border px-4 py-2 text-left">{user.name}</td>
                  <td className="border px-4 py-2 text-left">{user.email}</td>
                  <td className="border px-4 py-2 relative">
                    <div 
                      className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-md text-blue-700 inline-flex items-center justify-between w-32 cursor-pointer hover:shadow-sm transition-all duration-200 border border-blue-200"
                      onClick={() => toggleDropdown(idx)}
                    >
                      <span className="font-medium">{user.role}</span>
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
                            onClick={() => handleRoleChange(idx, role)}
                          >
                            {role}
                          </div>
                        ))}
                      </div>
                    )}
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