"use client"
import React, { use, useState } from "react";
import { FaBell, FaUserCircle, FaPlus, FaFilter, FaImages, FaTrash, FaWrench } from "react-icons/fa";
import BulkUploadModal from "./bulkuploadmodal"; 
import { AddEditPropertyModal } from './addPropertyModal';
import { EditConfirmationModal } from "./editConfirmationModal";
import { ConfirmationModal } from "./confirmationModal";
import { DeleteConfirmationModal } from "./deleteConfirmationModal";



export default function DashboardPage() {

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleEditConfirm = () => {
    if (selectedRow !== null) {
      // Example: Replace with actual row data retrieval
      const rowData = {
        nameContact: '',
        address: '',
        premise: '',
        area: '',
        rent: '',
        availability: 'Available',
        condition: 'New',
        sqft: '',
        key: 'Yes',
        brokerage: '',
        status: 'Active'
      };
      setEditData(rowData);
      setShowEditForm(true);
    }
    setShowEditModal(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedRow !== null) {
      // Perform delete action for selectedRow
      console.log(`Deleting row ${selectedRow}`);
    }
    setShowDeleteModal(false);
  };


  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Se
      {/* Header Section */}
      <div className="px-8 pt-8 pb-2 border-b border-blue-200">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-between" style={{ minWidth: 1150 }}>
            {/* Left: Dashboard Name */}
            <div className="flex-1 text-blue-600 font-bold text-lg">Data Operator Panel</div>
            {/* Center: Dashboard Name */}
            <div className="flex-1 flex justify-center">
              <span className="text-blue-600 font-bold text-lg">Data Operator Panel</span>
            </div>
            {/* Right: Icons */}
            <div className="flex-1 flex items-center justify-end gap-6">
              <FaBell className="text-black text-2xl cursor-pointer" />
              <FaUserCircle className="text-black text-2xl cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center border-2 rounded-lg px-2 py-1 mr-18">

            <span className="p-2"><FaImages className="text-blue-400" /></span>
          </div>
          <div className="flex items-center border-2 rounded-lg px-2 py-1" style={{ minWidth: 900 }}>
            <select className="mx-2 px-2 py-1 rounded bg-white text-black">
              <option>State</option>
            </select>
            <select className="mx-2 px-2 py-1 rounded bg-white text-black">
              <option>Ahmedabad</option>
            </select>
            <select className="mx-2 px-2 py-1 rounded bg-white text-black">
              <option>Area</option>
            </select>
            <select className="mx-2 px-2 py-1 rounded bg-white text-black">
              <option>type</option>
            </select>
            <select className="mx-2 px-2 py-1 rounded bg-white text-black">
              <option>Sub-type</option>
            </select>
            <select className="mx-2 px-2 py-1 rounded bg-white text-black">
              <option>Budget</option>
            </select>
            {/* <span className="p-2"><FaFilter className="text-blue-400" /></span> */}
          </div>
          <div className="flex items-center border-2 rounded-lg px-2 py-1 ml-18">

            <span className="p-2"><FaFilter className="text-blue-400" /></span>
          </div>
          {/* Bulk and Add Buttons */}

        </div>
        {/* Filter Buttons */}
        <div className="flex items-center justify-center mt-4 gap-2" style={{ minWidth: 900 }}>
          <button className="px-6 py-2 rounded-full border border-blue-200 bg-blue-100 text-black" style={{ minWidth: 146 }}>Sort by <span className="inline-block ml-2">→</span></button>
          <button className="px-6 py-2 rounded-full border border-blue-200 bg-white text-black" style={{ minWidth: 146 }}>New Projects</button>
          <button className="px-6 py-2 rounded-full border border-blue-200 bg-white text-black" style={{ minWidth: 146 }}>1BHK</button>
          <button className="px-6 py-2 rounded-full border border-blue-200 bg-white text-black" style={{ minWidth: 146 }}>2BHK</button>
          <button className="px-6 py-2 rounded-full border border-blue-200 bg-white text-black" style={{ minWidth: 146 }}>3+BHK</button>
          <button className="px-6 py-2 rounded-full border border-blue-200 bg-white text-black" style={{ minWidth: 146 }}>High To Low</button>
          <div className="flex items-center gap-4 ml-4">
            <BulkUploadModal />
          </div>
        </div>

        {/* Data Table */}
        <div className="flex justify-center mt-8 overflow-x-auto">
          <table className="border-collapse overflow-hidden shadow text-sm font-medium min-w-[1400px]">
            <thead>
              <tr className="bg-[#167F92] text-white">
                <th className="p-3 border"> <input type="checkbox" /> </th>
                <th className="p-3 border">Imp</th>
                <th className="p-3 border">Premium</th>
                <th className="p-3 border">Special Note</th>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Name & Contact</th>
                <th className="p-3 border">Address</th>
                <th className="p-3 border">Premise</th>
                <th className="p-3 border">Area</th>
                <th className="p-3 border">Rent</th>
                <th className="p-3 border">Availability</th>
                <th className="p-3 border">Condition</th>
                <th className="p-3 border">SqFt/Sqyd</th>
                <th className="p-3 border">Key</th>
                <th className="p-3 border">Brokerage</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Rented Out?</th>
                <th className="p-3 border sticky right-16 bg-[#167F92] z-10 border-l-2 w-16">Edit</th>
                <th className="p-3 border sticky right-0 bg-[#167F92] z-10 border-l-2 w-16">Delete</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy data rows */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((row, idx) => (
                <tr key={idx} className="text-gray-900">
                  <td className="p-3 border text-center"><input type="checkbox" /></td>
                  <td className="p-3 border text-center">{idx + 1}</td>
                  <td className="p-3 border text-center">{idx % 2 === 0 ? 'Yes' : ''}</td>
                  <td className="p-3 border text-center align-top whitespace-pre-line break-words">{idx % 3 === 0 ? 'Note' : ''}</td>
                  <td className="p-3 border text-center align-top whitespace-pre-line break-words">23/04/2025\n6d</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">Name {idx + 1}\n9876543210</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">Address line {idx + 1}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">Premise {idx + 1}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words bg-amber-400">Area {idx + 1}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">{10 + idx}.00 Thd</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words bg-green-400">1BHK Tenement</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">Furnished</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words bg-yellow-300">{800 + idx * 50} Sqft</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">Call To Owner</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">No Brokerage</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">Available</td>
                  <td className="p-3 border text-center"><input type="checkbox" /></td>
                  <td className="p-3 border text-center sticky right-16 bg-white z-10 border-l-2 w-16">
                  <FaWrench 
                    className="text-blue-600 text-xl cursor-pointer hover:text-blue-800 transition" 
                    title="Edit" 
                    onClick={() => {
                      setSelectedRow(idx);
                      setShowEditModal(true);
                    }}
                  />
                </td>
                <td className="p-3 border text-center sticky right-0 bg-white z-10 border-l-2 w-16">
                  <FaTrash 
                    className="text-black text-xl cursor-pointer hover:text-red-700 transition" 
                    title="Delete" 
                    onClick={() => {
                      setSelectedRow(idx);
                      setShowDeleteModal(true);
                    }}
                  />
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
              <EditConfirmationModal
        isOpen={showEditModal}
        onConfirm={handleEditConfirm}
        onClose={() => setShowEditModal(false)}
      />
      {editData && (
        <AddEditPropertyModal
          open={showEditForm}
          onClose={() => setShowEditForm(false)}
          mode="edit"
          initialData={editData}
          onSubmit={(data: any) => { setShowEditForm(false); /* handle save */ }}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onClose={() => setShowDeleteModal(false)}
      />

      </div>
      {/* Main Content Placeholder */}
      <div className="flex-1 p-8">{/* Dashboard content goes here */}</div>
    </div>
  );
} 