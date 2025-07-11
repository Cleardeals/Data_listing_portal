import React from 'react';
import Image from 'next/image';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xs p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-black font-bold">&times;</button>
        <div className="flex flex-col items-center mb-4">
          <Image 
            src="https://randomuser.me/api/portraits/men/32.jpg" 
            alt="Profile" 
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover mb-2" 
          />
          <div className="text-black font-medium">ID-12345</div>
          <div className="text-black">User Name</div>
        </div>
        <form className="space-y-3">
          <div>
            <label className="block text-black mb-1">Name</label>
            <input className="w-full border rounded px-2 py-1 text-black focus:outline-none" />
          </div>
          <div>
            <label className="block text-black mb-1">Phone Number</label>
            <input className="w-full border rounded px-2 py-1 text-black focus:outline-none" />
          </div>
          <div>
            <label className="block text-black mb-1">Email</label>
            <input className="w-full border rounded px-2 py-1 text-black focus:outline-none" />
          </div>
        </form>
        <div className="flex space-x-4 mt-6">
          <button className="flex-1 py-2 rounded bg-blue-500 text-white font-semibold">Done</button>
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded bg-blue-100 text-blue-900 font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 