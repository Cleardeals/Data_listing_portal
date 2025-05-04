import React, { useState } from 'react';

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ isOpen, onClose }) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold mb-4 text-center bg-gradient-to-b from-blue-100 to-white rounded-t-lg py-2">Sign In</h2>
        <div className="mb-4">
          <div className="flex items-center border rounded px-3 py-2 mb-3">
            <span className="text-gray-400 mr-2">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3 6a5 5 0 1 1 10 0A5 5 0 0 1 3 6zm5-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 8c-3.33 0-6 1.34-6 3v1h12v-1c0-1.66-2.67-3-6-3z"/></svg>
            </span>
            <input
              type="text"
              placeholder="Enter Mobile Number"
              className="w-full outline-none"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
            />
          </div>
          <div className="flex items-center border rounded px-3 py-2">
            <span className="text-gray-400 mr-2">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a4 4 0 0 0-4 4v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2V5a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v2H6V5a2 2 0 0 1 2-2zm-4 6h8v5H4V9z"/></svg>
            </span>
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button className="w-full bg-teal-700 text-white py-2 rounded hover:bg-teal-800 transition">Login</button>
      </div>
    </div>
  );
};

export default LoginForm; 