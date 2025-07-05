import React, { useState, useEffect } from 'react';
import { InternalUserFormData, InternalUser, availableRoles, availableStatusOptions } from '../lib/supabaseUsers';

interface AddEditInternalUserModalProps {
  open: boolean;
  onClose: () => void;
  mode?: 'add' | 'edit';
  userData?: InternalUser | null;
  onSave: (data: InternalUserFormData) => void;
}

// Define an interface for the errors object
interface FormErrors {
  [key: string]: string | null;
}

const AddEditInternalUserModal: React.FC<AddEditInternalUserModalProps> = ({
  open,
  onClose,
  mode = 'add',
  userData = null,
  onSave
}) => {
  // Initialize form data based on mode and userData - removed permission field
  const initialData = mode === 'edit' && userData ? {
    name: userData.name || '',
    email: userData.email || '',
    role: userData.role || '',
    contact: userData.contact || '',
    is_verified: userData.is_verified || false
  } : {
    name: '',
    email: '',
    role: '',
    contact: '',
    is_verified: false
  };

  const [formData, setFormData] = useState<InternalUserFormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when modal opens/closes or mode/userData changes
  useEffect(() => {
    const resetData = mode === 'edit' && userData ? {
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'data_operator',
      contact: userData.contact || '',
      is_verified: userData.is_verified || false
    } : {
      name: '',
      email: '',
      role: 'data_operator',
      contact: '',
      is_verified: false
    };
    
    setFormData(resetData);
    setErrors({});
  }, [mode, userData, open]);

  // Handle keyboard navigation and focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [open, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validate = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
      // Don't close here - let the parent component handle closing after successful save
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 relative transform transition-all duration-300 scale-100 animate-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold text-gray-800">
              {mode === 'edit' ? 'Edit Internal User' : 'Add Internal User'}
            </h2>
            <p id="modal-description" className="text-sm text-gray-600 mt-1">
              {mode === 'edit' ? 'Update internal user information' : 'Enter details to create a new internal user'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-6 space-y-5 max-h-96 overflow-y-auto">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className={`w-full px-4 py-3 border-2 ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
              } rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder:text-gray-500 text-gray-900`}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className={`w-full px-4 py-3 border-2 ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
              } rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder:text-gray-500 text-gray-900`}
            />
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Role and Contact Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                User Role <span className="text-red-500">*</span>
              </label>
              <div className="relative z-10">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 ${
                    errors.role ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white appearance-none cursor-pointer text-gray-900 hover:border-gray-300`}
                >
                  <option value="">Select Role</option>
                  {availableRoles.map((role) => (
                    <option key={role} value={role} className="text-gray-900 bg-white py-2">
                      {role === 'super_admin' ? 'Super Admin' : 'Data Operator'}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.role && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.role}
                </p>
              )}
            </div>

            {/* Verification Status Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Verification Status
              </label>
              <div className="relative z-10">
                <select
                  name="is_verified"
                  value={formData.is_verified ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_verified: e.target.value === 'true' })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white appearance-none cursor-pointer text-gray-900 hover:border-gray-300"
                >
                  {availableStatusOptions.map((status) => (
                    <option key={status.label} value={status.value.toString()} className="text-gray-900 bg-white py-2">
                      {status.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Contact Number
            </label>
            <input
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter contact number"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder:text-gray-500 text-gray-900"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-xl bg-white text-gray-700 font-semibold border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {mode === 'edit' ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditInternalUserModal;
