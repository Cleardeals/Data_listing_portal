import React, { useState } from 'react';
import { ExternalUser, ExternalUserFormData, getSubscriptionTypes } from '../lib/supabaseUsers';

interface AddEditExternalUserModalProps {
  open: boolean;
  onClose: () => void;
  mode?: 'add' | 'edit';
  userData?: ExternalUser | null;
  onSave: (data: ExternalUserFormData) => void;
}

// Define an interface for the errors object
interface FormErrors {
  [key: string]: string | null;
}

const AddEditExternalUserModal: React.FC<AddEditExternalUserModalProps> = ({
  open,
  onClose,
  mode = 'add',
  userData = null,
  onSave
}) => {
  const subscriptionTypes = getSubscriptionTypes();
  
  // Initialize form data based on mode and userData
  const initialData = mode === 'edit' && userData ? {
    name: userData.name || '',
    email: userData.email || '',
    business: userData.business || '',
    contact: userData.contact || '',
    subscription: userData.subscription || ''
  } : {
    name: '',
    email: '',
    business: '',
    contact: '',
    subscription: ''
  };

  const [formData, setFormData] = useState<ExternalUserFormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});

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
    if (!formData.business.trim()) newErrors.business = 'Business name is required';
    if (!formData.subscription) newErrors.subscription = 'Subscription is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'edit' ? 'Edit User' : 'Add User'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
            <input
              name="business"
              value={formData.business}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.business ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200`}
            />
            {errors.business && <p className="mt-1 text-sm text-red-500">{errors.business}</p>}
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <input
              name="contact"
              value={formData.contact}
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
            <select
              name="subscription"
              value={formData.subscription}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.subscription ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 bg-white`}
            >
              <option value="">Select Subscription</option>
              {subscriptionTypes.map((type) => (
                <option 
                  key={type} 
                  value={type}
                  className={type === 'Free' ? 'text-gray-600' : 
                    type === 'Basic' ? 'text-blue-600' : 
                    type === 'Premium' ? 'text-purple-600' : 'text-green-600'}
                >
                  {type}
                </option>
              ))}
            </select>
            {errors.subscription && <p className="mt-1 text-sm text-red-500">{errors.subscription}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4 mt-6 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {mode === 'edit' ? 'Save Changes' : 'Add User'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-md bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditExternalUserModal;
