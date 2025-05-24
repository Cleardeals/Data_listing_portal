"use client"
import React, { useState, useEffect } from "react";
import { FaBell, FaUserCircle, FaFilter, FaImages, FaTrash, FaWrench, FaPlus, FaSearch, FaRobot } from "react-icons/fa";
import BulkUploadButton from "@/components/modals/BulkUploadModal"; 
import { AddEditPropertyModal } from "@/components/modals/AddEditPropertyModal";
import { MdAddCall } from "react-icons/md";
import { EditConfirmationModal } from "@/components/modals/EditConfirmationModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import type { PropertyData } from "@/components/modals/AddEditPropertyModal";
import { fetchPropertyData, PropertyRow } from "@/lib/propertyData";
import { User } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface DashboardContentProps {
  user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<PropertyData | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      const data = await fetchPropertyData();
      setPropertyData(data);
    } catch (err) {
      console.error('Error loading property data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while loading property data');
      setPropertyData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditConfirm = () => {
    if (selectedRow !== null) {
      const rowData = propertyData.find(item => item.id === selectedRow);
      if (rowData) {
        const formattedData: PropertyData = {
          key: rowData.key ?? `${rowData.id}`,
          nameContact: rowData.nameContact,
          address: rowData.address,
          premise: rowData.premise,
          area: rowData.area,
          rent: rowData.rent,
          availability: rowData.availability,
          condition: rowData.condition,
          sqft: rowData.sqft,
          brokerage: rowData.brokerage,
          status: rowData.status
        };
        setEditData(formattedData);
        setShowEditForm(true);
      }
    }
    setShowEditModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-semibold text-gray-800">Data Operator Panel</span>
            <div className="relative">
              <FaUserCircle 
                className="text-2xl text-gray-600 cursor-pointer hover:text-gray-800"
                onClick={() => setShowProfile(!showProfile)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user.email}</span>
            <FaBell className="text-xl text-gray-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-7 gap-4">
          <div className="flex items-center space-x-2">
            <select className="form-select rounded-md border-gray-300 shadow-sm w-full text-black">
              <option className="text-black">State</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select className="form-select rounded-md border-gray-300 shadow-sm w-full text-black">
              <option className="text-black">Ahmedabad</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select className="form-select rounded-md border-gray-300 shadow-sm w-full text-black">
              <option className="text-black">Area</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select className="form-select rounded-md border-gray-300 shadow-sm w-full text-black">
              <option className="text-black">Type</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select className="form-select rounded-md border-gray-300 shadow-sm w-full text-black">
              <option className="text-black">Sub-type</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select className="form-select rounded-md border-gray-300 shadow-sm w-full text-black">
              <option className="text-black">Budget</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full flex items-center justify-center">
              <FaSearch className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-black font-medium">Sort by</button>
          <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-black font-medium">New Projects</button>
          <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-black font-medium">1BHK</button>
          <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-black font-medium">2BHK</button>
          <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-black font-medium">3+BHK</button>
          <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-black font-medium">High To Low</button>
          <div className="flex-grow"></div>
          <BulkUploadButton />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <FaPlus />
            <span>Add</span>
          </button>
        </div>

        {/* Data Display */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-600">{error}</div>
          </div>
        ) : propertyData.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">No properties found</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Important</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Special Note</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & Contact</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premise</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sqft/Spot</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brokerage</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {propertyData.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-black">{property.important}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-black">{property.premium}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-black">{property.specialNote}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-black">{property.date}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-black">{property.nameContact}</td>
                    <td className="px-3 py-4 text-black">{property.address}</td>
                    <td className="px-3 py-4 text-black">{property.premise}</td>
                    <td className="px-3 py-4 text-black">{property.area}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-black">{property.rent}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-black">{property.availability}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-black">{property.condition}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-black">{property.sqft}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-black">{property.key}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-black">{property.brokerage}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-black">{property.status}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedRow(property.id);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        <FaWrench className="inline-block" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRow(property.id);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="inline-block" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddEditPropertyModal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        mode="add"
        initialData={null}
        onSubmit={(data) => {
          setShowAddForm(false);
          loadData(); // Reload data after adding
        }}
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
          onSubmit={(data) => {
            setShowEditForm(false);
            loadData(); // Reload data after editing
          }}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={() => {
          if (selectedRow !== null) {
            setPropertyData(propertyData.filter(item => item.id !== selectedRow));
          }
          setShowDeleteModal(false);
        }}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
