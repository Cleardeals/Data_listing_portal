"use client"
import React, { useState, useEffect } from "react";
import { FaBell, FaUserCircle, FaFilter, FaImages, FaTrash, FaWrench, FaPlus } from "react-icons/fa";
import BulkUploadButton from "@/components/modals/BulkUploadModal"; 
import { AddEditPropertyModal } from "@/components/modals/AddEditPropertyModal";
import { EditConfirmationModal } from "@/components/modals/EditConfirmationModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import type { PropertyData } from "@/components/modals/AddEditPropertyModal";
import { fetchPropertyData, PropertyRow } from "@/lib/propertyData";

export default function DashboardPage() {

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<PropertyData | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyRow[]>([]);

  useEffect(() => {
    // Fetch property data when component mounts
    const data = fetchPropertyData();
    setPropertyData(data);
  }, []);

  const handleEditConfirm = () => {
    if (selectedRow !== null) {
      const rowData = propertyData.find(item => item.id === selectedRow);
      if (rowData) {
        // Convert the fetched data to PropertyData format
        const formattedData: PropertyData = {
          nameContact: rowData.nameContact,
          address: rowData.address,
          premise: rowData.premise,
          area: rowData.area,
          rent: rowData.rent,
          availability: rowData.availability,
          condition: rowData.condition,
          sqft: rowData.sqft,
          key: rowData.key,
          brokerage: rowData.brokerage,
          status: rowData.status
        };
        setEditData(formattedData);
        setShowEditForm(true);
      }
    }
    setShowEditModal(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedRow !== null) {
      // Perform delete action for selectedRow
      console.log(`Deleting row ${selectedRow}`);
      // Filter out the deleted row from the data
      setPropertyData(propertyData.filter(item => item.id !== selectedRow));
    }
    setShowDeleteModal(false);
  };

  const handleAddProperty = (data: PropertyData) => {
    console.log('New property data:', data);
    // Create a new property with generated ID
    const newProperty: PropertyRow = {
      id: propertyData.length > 0 ? Math.max(...propertyData.map(p => p.id)) + 1 : 1,
      important: propertyData.length + 1,
      premium: "",
      specialNote: "",
      date: new Date().toLocaleDateString('en-GB'),
      nameContact: data.nameContact,
      address: data.address,
      premise: data.premise,
      area: data.area,
      rent: data.rent,
      availability: data.availability,
      condition: data.condition,
      sqft: data.sqft,
      key: data.key,
      brokerage: data.brokerage,
      status: data.status,
      rentedOut: false
    };
    setPropertyData([...propertyData, newProperty]);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

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
            <BulkUploadButton />
            <button 
              onClick={() => setShowAddForm(true)} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 transition"
            >
              <FaPlus /> Add Property
            </button>
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
              {propertyData.map((property) => (
                <tr key={property.id} className="text-gray-900">
                  <td className="p-3 border text-center"><input type="checkbox" /></td>
                  <td className="p-3 border text-center">{property.important}</td>
                  <td className="p-3 border text-center">{property.premium}</td>
                  <td className="p-3 border text-center align-top whitespace-pre-line break-words">{property.specialNote}</td>
                  <td className="p-3 border text-center align-top whitespace-pre-line break-words">{property.date}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">{property.nameContact}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">{property.address}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">{property.premise}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words bg-amber-400">{property.area}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">{property.rent}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words bg-green-400">{property.availability}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">{property.condition}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words bg-yellow-300">{property.sqft}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">{property.key}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">{property.brokerage}</td>
                  <td className="p-3 border align-top whitespace-pre-line break-words">{property.status}</td>
                  <td className="p-3 border text-center"><input type="checkbox" checked={property.rentedOut} readOnly /></td>
                  <td className="p-3 border text-center sticky right-16 bg-white z-10 border-l-2 w-16">
                    <FaWrench 
                      className="text-blue-600 text-xl cursor-pointer hover:text-blue-800 transition" 
                      title="Edit" 
                      onClick={() => {
                        setSelectedRow(property.id);
                        setShowEditModal(true);
                      }}
                    />
                  </td>
                  <td className="p-3 border text-center sticky right-0 bg-white z-10 border-l-2 w-16">
                    <FaTrash 
                      className="text-black text-xl cursor-pointer hover:text-red-700 transition" 
                      title="Delete" 
                      onClick={() => {
                        setSelectedRow(property.id);
                        setShowDeleteModal(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <AddEditPropertyModal
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          mode="add"
          initialData={null}
          onSubmit={handleAddProperty}
        />

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
            onSubmit={(data: PropertyData) => { 
              console.log('Updated data:', data); // Add some handling for the data
              setShowEditForm(false); 
            }}
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