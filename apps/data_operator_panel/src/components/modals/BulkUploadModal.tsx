"use client"

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function BulkUploadButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setSelectedFile(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && (file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      // Add your upload logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload
      console.log('File uploaded:', selectedFile.name);
      closeModal();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="font-sans">
      {/* Enhanced Bulk Upload Button */}
      <button 
        onClick={openModal}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 hover:border-emerald-400 transition-all duration-200 shadow-sm"
      >
        <span className="text-sm">📊</span>
        <span>Bulk Upload</span>
        <span className="text-sm">+</span>
      </button>

      {/* Enhanced Modal */}
      {isOpen && isClient && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm" style={{ top: 0, left: 0, width: '100vw', height: '100vh', position: 'fixed' }}>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20 mt-8 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-2xl px-6 py-4 border-b border-slate-600/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-400 text-lg">📊</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Bulk Upload Properties</h3>
                    <p className="text-slate-300 text-sm">Upload Excel file to add multiple properties</p>
                  </div>
                </div>
                <button 
                  onClick={closeModal} 
                  className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Body - with scroll */}
            <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              {/* File Upload Area */}
              <div 
                className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls"
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl text-green-600">📄</span>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-800">{selectedFile.name}</p>
                      <p className="text-sm text-slate-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Upload Icon */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl text-blue-600">☁️</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-xs text-blue-600">+</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-lg font-medium text-slate-800 mb-2">
                        Drop your Excel file here, or click to browse
                      </p>
                      <p className="text-sm text-slate-600">
                        Supports .xlsx and .xls files up to 10MB
                      </p>
                    </div>
                    
                    <button 
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors duration-200"
                    >
                      <span className="text-sm">📁</span>
                      Choose File
                    </button>
                  </div>
                )}
              </div>
              
              {/* Instructions */}
              <div className="mt-6 bg-slate-50/80 rounded-xl p-4 border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-sm">💡</span>
                  Instructions
                </h4>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Download the template file and fill in your property data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Ensure all required fields are properly filled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Maximum file size: 10MB</span>
                  </li>
                </ul>
                <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium underline">
                  Download Template
                </button>
              </div>
              
              {/* Footer Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  <span>Upload will be processed immediately</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:ring-2 focus:ring-slate-500 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 focus:ring-2 focus:ring-emerald-500 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>📊</span>
                        <span>Import Properties</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
