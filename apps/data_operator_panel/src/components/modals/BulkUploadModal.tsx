"use client"

import { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';

export default function BulkUploadButton() {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  return (
    <div className="font-sans">
      {/* Bulk Button */}
      <button 
        onClick={openPopup}
        className="flex items-center gap-2 px-6 py-2 rounded-md border border-blue-400 bg-blue-100 text-blue-600 font-semibold hover:bg-blue-50"
      >
        Bulk <Plus size={16} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* Modal Content */}
          <div className="bg-white rounded-lg shadow-lg w-96 max-w-md">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-l text-gray-800">Upload Excel To Add Listings</h3>
              <button onClick={closePopup} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
                {/* Cloud Icon */}
                <div className="flex mb-4">
                  <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Upload className="text-white" size={24} />
                  </div>
                  <div className="h-10 w-10 bg-blue-200 rounded-full ml-2 mt-2"></div>
                </div>
                
                {/* Upload Button */}
                <button className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-md font-medium flex items-center gap-2">
                  Upload <Upload size={16} />
                </button>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={closePopup}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
