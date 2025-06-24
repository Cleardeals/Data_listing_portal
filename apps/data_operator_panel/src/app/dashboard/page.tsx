"use client"
import React, { useState, useEffect } from "react";
import { FaBell, FaUserCircle, FaFilter, FaTrash, FaWrench, FaPlus, FaSearch, FaRobot, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BulkUploadButton from "@/components/modals/BulkUploadModal"; 
import { AddEditPropertyModal } from "@/components/modals/AddEditPropertyModal";
import { MdAddCall } from "react-icons/md";
import { EditConfirmationModal } from "@/components/modals/EditConfirmationModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import Pagination from "@/components/ui/pagination";
import type { PropertyData } from "@/components/modals/AddEditPropertyModal";
import { SupabasePropertyData } from "@/lib/propertyData";
import { supabase } from "../../lib/supabase";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<PropertyData | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [propertyData, setPropertyData] = useState<SupabasePropertyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'default' | 'prompt'>('default');
  const [promptInput, setPromptInput] = useState("");
  const [filterValues, setFilterValues] = useState({
    state: "State",
    city: "Ahmedabad",
    area: "Area",
    type: "type",
    subtype: "Sub-type",
    budget: "Budget"
  });
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Track reconnection attempts with ref instead of state to avoid re-renders
  const reconnectAttemptRef = React.useRef(false);

  // Fetch properties from Supabase with pagination
  const fetchProperties = React.useCallback(async (page: number = 1, size: number = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have a session before fetching
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        // We'll let the ProtectedRoute handle the redirection
        return;
      }
      
      // First, get the total count
      const { count, error: countError } = await supabase
        .from('propertydata')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      setTotalCount(count || 0);

      // Then fetch the paginated data
      const from = (page - 1) * size;
      const to = from + size - 1;

      const { data, error: supabaseError } = await supabase
        .from('propertydata')
        .select('*')
        .order('date_stamp', { ascending: false })
        .range(from, to);

      if (supabaseError) {
        throw supabaseError;
      }

      setPropertyData(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, []);  // Pagination handlers
  const handlePageChange = React.useCallback(async (page: number) => {
    setCurrentPage(page);
    await fetchProperties(page, pageSize);
  }, [fetchProperties, pageSize]);

  const handlePageSizeChange = React.useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchProperties(1, newPageSize);
  }, [fetchProperties]);

  useEffect(() => {
    // Fetch property data when component mounts
    fetchProperties(1, 50);

    // Setup real-time subscription
    const setupRealtime = () => {
      try {
        const channel = supabase
          .channel('property-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'propertydata'
            },
            (payload) => {
              handleRealtimeChange(payload as RealtimePostgresChangesPayload<SupabasePropertyData>);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setRealtimeStatus('connected');
              reconnectAttemptRef.current = false;
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              setRealtimeStatus('disconnected');
              // If we get disconnected, attempt to reconnect after a delay - only once
              if (!reconnectAttemptRef.current) {
                reconnectAttemptRef.current = true;
                setTimeout(() => {
                  setupRealtime();
                }, 5000);
              }
            } else {
              setRealtimeStatus('connecting');
            }
          });

        setRealtimeChannel(channel);
        return channel;
      } catch {
        setRealtimeStatus('disconnected');
        setError('Failed to establish real-time connection. Please refresh the page.');
        return null;
      }
    };

    const channel = setupRealtime();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // Error removing channel
        }
      }
    };
  }, [fetchProperties]); // Remove the dependency on realtimeStatus

  // Handle real-time changes
  const handleRealtimeChange = (payload: RealtimePostgresChangesPayload<SupabasePropertyData>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setPropertyData(currentData => {
      switch (eventType) {
        case 'INSERT':
          // Add new record if it doesn't exist
          if (newRecord) {
            const existingIndex = currentData.findIndex(item => item.serial_number === newRecord.serial_number);
            if (existingIndex === -1) {
              return [newRecord, ...currentData];
            }
          }
          return currentData;
          
        case 'UPDATE':
          // Update existing record
          if (newRecord) {
            return currentData.map(item => 
              item.serial_number === newRecord.serial_number ? newRecord : item
            );
          }
          return currentData;
          
        case 'DELETE':
          // Remove deleted record
          if (oldRecord) {
            return currentData.filter(item => item.serial_number !== oldRecord.serial_number);
          }
          return currentData;
          
        default:
          return currentData;
      }
    });
  };

  const handleAddProperty = async (data: PropertyData) => {
    try {
      const newProperty = {
        owner_name: data.owner_name,
        owner_contact: data.owner_contact,
        area: data.area,
        address: data.address,
        property_type: data.property_type,
        sub_property_type: data.sub_property_type,
        size: typeof data.size === 'string' ? parseFloat(data.size) || null : data.size,
        furnishing_status: data.furnishing_status,
        availability: data.availability,
        floor: data.floor,
        tenant_preference: data.tenant_preference,
        additional_details: data.additional_details,
        age: data.age,
        rent_or_sell_price: data.rent_or_sell_price,
        deposit: data.deposit,
        special_note: data.special_note,
        rent_sold_out: false
      };

      const { error } = await supabase
        .from('propertydata')
        .insert([newProperty])
        .select();

      if (error) throw error;

      setShowAddForm(false);
      // Refresh current page to show the new property
      await fetchProperties(currentPage, pageSize);
      console.log('Successfully added new property');
    } catch (err: unknown) {
      console.error('Error adding property:', err);
      setError(err instanceof Error ? err.message : 'Failed to add property');
    }
  };

  const handleEditProperty = async (data: PropertyData) => {
    if (selectedRow === null) return;
    
    try {
      const updatedProperty = {
        owner_name: data.owner_name,
        owner_contact: data.owner_contact,
        area: data.area,
        address: data.address,
        property_type: data.property_type,
        sub_property_type: data.sub_property_type,
        size: typeof data.size === 'string' ? parseFloat(data.size) || null : data.size,
        furnishing_status: data.furnishing_status,
        availability: data.availability,
        floor: data.floor,
        tenant_preference: data.tenant_preference,
        additional_details: data.additional_details,
        age: data.age,
        rent_or_sell_price: data.rent_or_sell_price,
        deposit: data.deposit,
        special_note: data.special_note
      };

      const { error } = await supabase
        .from('propertydata')
        .update(updatedProperty)
        .eq('serial_number', selectedRow);

      if (error) throw error;

      setShowEditForm(false);
      setEditData(null);
      // Refresh current page to show the updated property
      await fetchProperties(currentPage, pageSize);
      console.log('Successfully updated property');
    } catch (err: unknown) {
      console.error('Error updating property:', err);
      setError(err instanceof Error ? err.message : 'Failed to update property');
    }
  };

  const handleEditConfirm = () => {
    if (selectedRow !== null) {
      const rowData = propertyData.find(item => item.serial_number === selectedRow);
      if (rowData) {
        // Convert the fetched data to PropertyData format
        const formattedData: PropertyData = {
          owner_name: rowData.owner_name || '',
          owner_contact: rowData.owner_contact || '',
          area: rowData.area || 'N/A',
          address: rowData.address || '',
          property_type: rowData.property_type || 'N/A',
          sub_property_type: rowData.sub_property_type || 'N/A',
          size: rowData.size || '',
          furnishing_status: rowData.furnishing_status || 'N/A',
          availability: rowData.availability || '',
          floor: rowData.floor || '',
          tenant_preference: rowData.tenant_preference || 'N/A',
          additional_details: rowData.additional_details || '',
          age: rowData.age || '',
          rent_or_sell_price: rowData.rent_or_sell_price || '',
          deposit: rowData.deposit || '',
          special_note: rowData.special_note || ''
        };
        setEditData(formattedData);
        setShowEditForm(true);
      }
    }
    setShowEditModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRow !== null) {
      try {
        setError(null); // Clear any previous errors
        
        const { error } = await supabase
          .from('propertydata')
          .delete()
          .eq('serial_number', selectedRow);

        if (error) {
          console.error('Supabase delete error:', error);
          throw error;
        }

        console.log(`Successfully deleted row ${selectedRow}`);
        
        // Refresh current page to reflect the deletion
        await fetchProperties(currentPage, pageSize);
        
        setSelectedRow(null);
      } catch (err: unknown) {
        console.error('Error deleting property:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete property');
      }
    }
    setShowDeleteModal(false);
  };

  // Search handler with Supabase filtering
  const handleSearch = async () => {
    if (searchMode === 'prompt') {
      // Handle AI-style prompt search
      if (!promptInput.trim()) {
        fetchProperties();
        return;
      }

      try {
        setLoading(true);
        // Search across multiple fields using ilike (case-insensitive)
        const { data, error } = await supabase
          .from('propertydata')
          .select('*')
          .or(`name.ilike.%${promptInput}%,address.ilike.%${promptInput}%,area.ilike.%${promptInput}%,premise.ilike.%${promptInput}%`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPropertyData(data || []);
      } catch (err: unknown) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    } else {
      // Handle filter-based search
      try {
        setLoading(true);
        let query = supabase.from('propertydata').select('*');

        // Apply filters based on selected values
        if (filterValues.city !== 'Ahmedabad') {
          query = query.ilike('address', `%${filterValues.city}%`);
        }
        if (filterValues.area !== 'Area') {
          query = query.ilike('area', `%${filterValues.area}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setPropertyData(data || []);
      } catch (err: unknown) {
        console.error('Filter error:', err);
        setError(err instanceof Error ? err.message : 'Filter failed');
      } finally {
        setLoading(false);
      }
    }
  };

  // Quick filter functions
  const handleQuickFilter = async (filterType: string) => {
    try {
      setLoading(true);
      let query = supabase.from('propertydata').select('*');

      switch (filterType) {
        case 'available':
          query = query.eq('rentedout', false);
          break;
        case 'rented':
          query = query.eq('rentedout', true);
          break;
        case 'important':
          query = query.gt('important', 0);
          break;
        case 'premium':
          query = query.neq('premium', '').neq('premium', null);
          break;
        case 'today':
          const today = new Date().toLocaleDateString('en-GB');
          query = query.eq('date', today);
          break;
        default:
          // Show all
          break;
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setPropertyData(data || []);
    } catch (err: unknown) {
      console.error('Quick filter error:', err);
      setError(err instanceof Error ? err.message : 'Filter failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header Section */}
      <header className="dashboard-header flex justify-between items-center py-4 px-8 border-b bg-white shadow-sm sticky top-0 z-50 w-full ">
        <div className="text-xl font-semibold text-blue-600">Data Operator Panel</div>
        <div className="flex items-center space-x-6">
          {user && (
            <div className="text-sm text-gray-600">
              Welcome, {user.email}
            </div>
          )}
          <button title="Add User" className="text-2xl"><MdAddCall className="text-blue-500" /></button>
          <button title="Notifications" className="text-2xl"><FaBell className="text-blue-500" /></button>
          <button title="Profile" className="text-2xl"><FaUserCircle className="text-blue-500" /></button>
          <button 
            title="Logout" 
            className="text-2xl text-red-500 hover:text-red-700 transition-colors" 
            onClick={handleLogout}
          >
            <FaSignOutAlt />
          </button>
        </div>
      </header>
      <div className="px-8 pt-8 pb-2 border-b border-blue-200">
        {/* <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} /> */}
        <div className="flex items-center justify-center mt-6">
          {/* Robot Toggle Button */}
          <button
            className={`flex items-center border-2 rounded-lg px-2 py-1 mr-4 transition-colors duration-200 ${
              searchMode === 'prompt' ? 'bg-blue-600' : 'bg-white'
            }`}
            onClick={() => setSearchMode(searchMode === 'prompt' ? 'default' : 'prompt')}
            title="Toggle AI Search"
          >
            <span className="p-2">
              <FaRobot className={searchMode === 'prompt' ? 'text-white' : 'text-blue-400'} />
            </span>
          </button>
          {/* Prompt or Filter UI */}
          {searchMode === 'prompt' ? (
            <div className="flex items-center border-2 rounded-lg px-2 py-1" style={{ minWidth: 900 }}>
              <input
                className="flex-1 px-4 py-2 rounded bg-white text-black outline-none"
                placeholder="Search by Specification"
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
              />
            </div>
          ) : (
            <div className="flex items-center border-2 rounded-lg px-2 py-1" style={{ minWidth: 900 }}>
              <select className="mx-2 px-2 py-1 rounded bg-white text-black" value={filterValues.state} onChange={e => setFilterValues(v => ({ ...v, state: e.target.value }))}>
                <option>State</option>
              </select>
              <select className="mx-2 px-2 py-1 rounded bg-white text-black" value={filterValues.city} onChange={e => setFilterValues(v => ({ ...v, city: e.target.value }))}>
                <option>Ahmedabad</option>
              </select>
              <select className="mx-2 px-2 py-1 rounded bg-white text-black" value={filterValues.area} onChange={e => setFilterValues(v => ({ ...v, area: e.target.value }))}>
                <option>Area</option>
              </select>
              <select className="mx-2 px-2 py-1 rounded bg-white text-black" value={filterValues.type} onChange={e => setFilterValues(v => ({ ...v, type: e.target.value }))}>
                <option>type</option>
              </select>
              <select className="mx-2 px-2 py-1 rounded bg-white text-black" value={filterValues.subtype} onChange={e => setFilterValues(v => ({ ...v, subtype: e.target.value }))}>
                <option>Sub-type</option>
              </select>
              <select className="mx-2 px-2 py-1 rounded bg-white text-black" value={filterValues.budget} onChange={e => setFilterValues(v => ({ ...v, budget: e.target.value }))}>
                <option>Budget</option>
              </select>
            </div>
          )}
          {/* Search Icon */}
          <button
            className="flex items-center border-2 rounded-lg px-2 py-1 ml-2"
            onClick={handleSearch}
            disabled={loading}
            title="Search"
          >
            <span className="p-2">
              <FaSearch className="text-blue-600" />
            </span>
          </button>
          {/* Clear Search Button */}
          <button
            className="flex items-center border-2 rounded-lg px-2 py-1 ml-2 bg-white-100 "
            onClick={() => {
              setPromptInput('');
              setFilterValues({
                state: "State",
                city: "Ahmedabad", 
                area: "Area",
                type: "type",
                subtype: "Sub-type",
                budget: "Budget"
              });
              fetchProperties();
            }}
            title="Clear Search"
          >
            <span className="p-2">
              <FaTimes className="text-blue-600"/>
            </span>
          </button>
          {/* Filter Button */}
          <button
            className="flex items-center border-2 rounded-lg px-2 py-1 ml-2"
            onClick={() => setSearchMode('default')}
          >
            <span className="p-2">
              <FaFilter className="text-blue-400" />
            </span>
          </button>
        </div>
        {/* Filter Buttons */}
        <div className="flex items-center justify-center mt-4 gap-2" style={{ minWidth: 900 }}>
          <button 
            onClick={() => fetchProperties()}
            className="px-6 py-2 rounded-full border border-blue-200 bg-blue-100 text-black hover:bg-blue-200 transition" 
            style={{ minWidth: 146 }}
          >
            All Properties
          </button>
          <button 
            onClick={() => handleQuickFilter('available')}
            className="px-6 py-2 rounded-full border border-green-200 bg-green-100 text-black hover:bg-green-200 transition" 
            style={{ minWidth: 146 }}
          >
            Available
          </button>
          <button 
            onClick={() => handleQuickFilter('rented')}
            className="px-6 py-2 rounded-full border border-red-200 bg-red-100 text-black hover:bg-red-200 transition" 
            style={{ minWidth: 146 }}
          >
            Rented Out
          </button>
          <button 
            onClick={() => handleQuickFilter('important')}
            className="px-6 py-2 rounded-full border border-yellow-200 bg-yellow-100 text-black hover:bg-yellow-200 transition" 
            style={{ minWidth: 146 }}
          >
            Important
          </button>
          <button 
            onClick={() => handleQuickFilter('premium')}
            className="px-6 py-2 rounded-full border border-purple-200 bg-purple-100 text-black hover:bg-purple-200 transition" 
            style={{ minWidth: 146 }}
          >
            Premium
          </button>
          <button 
            onClick={() => handleQuickFilter('today')}
            className="px-6 py-2 rounded-full border border-orange-200 bg-orange-100 text-black hover:bg-orange-200 transition" 
            style={{ minWidth: 146 }}
          >
            Today&apos;s Entries
          </button>
          <div className="flex items-center gap-4 ml-4">
            <BulkUploadButton />
            <button 
              onClick={() => setShowAddForm(true)} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 transition"
            >
              <FaPlus /> Add Property
            </button>
            {/* Real-time Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
              <div className={`w-2 h-2 rounded-full ${
                realtimeStatus === 'connected' ? 'bg-green-500' : 
                realtimeStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-600">
                {realtimeStatus === 'connected' ? 'Live' : 
                 realtimeStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex justify-center mt-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <span>❌ {error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="flex justify-center mt-8 overflow-x-auto">
          <table className="border-collapse overflow-hidden shadow text-sm font-medium min-w-[1400px]">
            <thead>
              <tr className="bg-[#167F92] text-white">
                <th className="p-3 border"> <input type="checkbox" /> </th>
                <th className="p-3 border">Property ID</th>
                <th className="p-3 border">Property Type</th>
                <th className="p-3 border">Special Note</th>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Owner & Contact</th>
                <th className="p-3 border">Address</th>
                <th className="p-3 border">Area</th>
                <th className="p-3 border">Sub Property Type</th>
                <th className="p-3 border">Size (sq ft)</th>
                <th className="p-3 border">Furnishing</th>
                <th className="p-3 border">Availability</th>
                <th className="p-3 border">Floor</th>
                <th className="p-3 border">Tenant Preference</th>
                <th className="p-3 border">Age</th>
                <th className="p-3 border">Price</th>
                <th className="p-3 border">Deposit</th>
                <th className="p-3 border">Rent/Sold Out?</th>
                <th className="p-3 border sticky right-16 bg-[#167F92] z-10 border-l-2 w-16">Edit</th>
                <th className="p-3 border sticky right-0 bg-[#167F92] z-10 border-l-2 w-16">Delete</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={20} className="p-8 text-center text-gray-500">
                    Loading properties...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={20} className="p-8 text-center text-red-500">
                    Error: {error}
                  </td>
                </tr>
              ) : propertyData.length === 0 ? (
                <tr>
                  <td colSpan={20} className="p-8 text-center text-gray-500">
                    No properties found
                  </td>
                </tr>
              ) : (
                propertyData.map((property) => (
                  <tr key={property.serial_number} className="text-gray-900">
                    <td className="p-3 border text-center"><input type="checkbox" /></td>
                    <td className="p-3 border text-center">{property.property_id}</td>
                    <td className="p-3 border text-center">{property.property_type}</td>
                    <td className="p-3 border text-center align-top whitespace-pre-line break-words">{property.special_note}</td>
                    <td className="p-3 border text-center align-top whitespace-pre-line break-words">{property.date_stamp ? new Date(property.date_stamp).toLocaleDateString() : ''}</td>
                    <td className="p-3 border align-top whitespace-pre-line break-words">{`${property.owner_name || ''}\n${property.owner_contact || ''}`}</td>
                    <td className="p-3 border align-top whitespace-pre-line break-words">{property.address}</td>
                    <td className="p-3 border align-top whitespace-pre-line break-words bg-amber-400">{property.area}</td>
                    <td className="p-3 border align-top whitespace-pre-line break-words">{property.sub_property_type}</td>
                    <td className="p-3 border align-top whitespace-pre-line break-words bg-yellow-300">{property.size}</td>
                    <td className="p-3 border align-top whitespace-pre-line break-words">{property.furnishing_status}</td>
                    <td className="p-3 border align-top whitespace-pre-line break-words bg-green-400">{property.availability}</td>
                    <td className="p-3 border align-top whitespace-pre-line break-words">{property.floor}</td>
                    <td className="p-3 border align-top whitespace-pre-line break-words">{property.tenant_preference}</td>
                    <td className="p-3 border align-top whitespace-pre-line break-words">{property.age}</td>
                    <td className="p-3 border align-top whitespace-pre-line break-words">{property.rent_or_sell_price}</td>
                    <td className="p-3 border align-top whitespace-pre-line break-words">{property.deposit}</td>
                    <td className="p-3 border text-center"><input type="checkbox" checked={property.rent_sold_out || false} readOnly /></td>
                    <td className="p-3 border text-center sticky right-16 bg-white z-10 border-l-2 w-16">
                      <FaWrench 
                        className="text-blue-600 text-xl cursor-pointer hover:text-blue-800 transition" 
                        title="Edit" 
                        onClick={() => {
                          setSelectedRow(property.serial_number);
                          setShowEditModal(true);
                        }}
                      />
                    </td>
                    <td className="p-3 border text-center sticky right-0 bg-white z-10 border-l-2 w-16">
                      <FaTrash 
                        className="text-black text-xl cursor-pointer hover:text-red-700 transition" 
                        title="Delete" 
                        onClick={() => {
                          setSelectedRow(property.serial_number);
                          setShowDeleteModal(true);
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="mt-6"
          />
        )}
        
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
            onSubmit={handleEditProperty}
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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}