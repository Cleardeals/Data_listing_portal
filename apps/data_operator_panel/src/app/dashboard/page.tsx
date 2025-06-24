"use client"
import React, { useState, useEffect } from "react";
import { FaBell, FaUserCircle, FaFilter, FaPlus, FaSearch, FaRobot, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BulkUploadButton from "@/components/modals/BulkUploadModal"; 
import { AddEditPropertyModal } from "@/components/modals/AddEditPropertyModal";
import { MdAddCall } from "react-icons/md";
import { EditConfirmationModal } from "@/components/modals/EditConfirmationModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import Pagination from "@/components/ui/pagination";
import SortControls from "@/components/SortControls";
import type { PropertyData } from "@/components/modals/AddEditPropertyModal";
import { SupabasePropertyData } from "@/lib/propertyData";
import { supabase } from "../../lib/supabase";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

function DashboardContent() {
  const router = useRouter();
  const { user, logout, refreshSession } = useAuth();
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
  
  // Sort state - default to serial_number ascending
  const [sortColumn, setSortColumn] = useState<'serial_number' | 'rent_or_sell_price' | null>('serial_number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Track reconnection attempts with ref instead of state to avoid re-renders
  const reconnectAttemptRef = React.useRef(false);
  const sessionMonitorRef = React.useRef<NodeJS.Timeout | null>(null);

  // Session monitoring function
  const monitorSession = React.useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('Session expired or invalid, logging out...');
        await logout();
        router.push('/auth/login');
        return;
      }
      
      // Check if session is about to expire (within 10 minutes)
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const timeUntilExpiry = (expiresAt * 1000) - Date.now();
        const tenMinutesInMs = 10 * 60 * 1000;
        
        if (timeUntilExpiry <= tenMinutesInMs && timeUntilExpiry > 0) {
          console.log('Session expiring soon, attempting refresh...');
          await refreshSession();
        }
      }
    } catch (error) {
      console.error('Error monitoring session:', error);
      await logout();
      router.push('/auth/login');
    }
  }, [logout, router, refreshSession]);

  // Fetch properties from Supabase with pagination and sorting
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

      // Build query with sorting
      let query = supabase
        .from('propertydata')
        .select('*');

      // Apply sorting if specified
      if (sortColumn) {
        query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      } else {
        // Default sort by serial_number ascending
        query = query.order('serial_number', { ascending: true });
      }

      const { data, error: supabaseError } = await query.range(from, to);

      if (supabaseError) {
        throw supabaseError;
      }

      setPropertyData(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, [sortColumn, sortDirection]);  // Pagination handlers
  const handlePageChange = React.useCallback(async (page: number) => {
    setCurrentPage(page);
    await fetchProperties(page, pageSize);
  }, [fetchProperties, pageSize]);

  const handlePageSizeChange = React.useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchProperties(1, newPageSize);
  }, [fetchProperties]);

  // Sort handler
  const handleSort = (column: 'serial_number' | 'rent_or_sell_price') => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
    fetchProperties(1, pageSize);
  };

  // Clear sort handler
  const handleClearSort = () => {
    setSortColumn(null);
    setSortDirection('asc');
    setCurrentPage(1);
    fetchProperties(1, pageSize);
  };

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

  // Setup session monitoring
  React.useEffect(() => {
    if (user) {
      // Check session immediately
      monitorSession();
      
      // Set up interval to check session every 5 minutes
      const interval = setInterval(monitorSession, 5 * 60 * 1000);
      sessionMonitorRef.current = interval;
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      // Clear interval if user logs out
      if (sessionMonitorRef.current) {
        clearInterval(sessionMonitorRef.current);
        sessionMonitorRef.current = null;
      }
    }
  }, [user, monitorSession]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (sessionMonitorRef.current) {
        clearInterval(sessionMonitorRef.current);
      }
    };
  }, []);

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
        <div className="flex items-center justify-center mt-6 gap-3 flex-wrap">
          <button 
            onClick={() => fetchProperties()}
            className="px-6 py-2.5 rounded-lg border border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 hover:from-blue-100 hover:to-blue-200 font-medium transition-all duration-200 shadow-sm hover:shadow-md" 
            style={{ minWidth: 146 }}
          >
            📋 All Properties
          </button>
          <button 
            onClick={() => handleQuickFilter('available')}
            className="px-6 py-2.5 rounded-lg border border-green-300 bg-gradient-to-r from-green-50 to-green-100 text-green-800 hover:from-green-100 hover:to-green-200 font-medium transition-all duration-200 shadow-sm hover:shadow-md" 
            style={{ minWidth: 146 }}
          >
            ✅ Available
          </button>
          <button 
            onClick={() => handleQuickFilter('rented')}
            className="px-6 py-2.5 rounded-lg border border-red-300 bg-gradient-to-r from-red-50 to-red-100 text-red-800 hover:from-red-100 hover:to-red-200 font-medium transition-all duration-200 shadow-sm hover:shadow-md" 
            style={{ minWidth: 146 }}
          >
            🏠 Rented Out
          </button>
          <button 
            onClick={() => handleQuickFilter('important')}
            className="px-6 py-2.5 rounded-lg border border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 hover:from-yellow-100 hover:to-yellow-200 font-medium transition-all duration-200 shadow-sm hover:shadow-md" 
            style={{ minWidth: 146 }}
          >
            ⭐ Important
          </button>
          <button 
            onClick={() => handleQuickFilter('premium')}
            className="px-6 py-2.5 rounded-lg border border-purple-300 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 hover:from-purple-100 hover:to-purple-200 font-medium transition-all duration-200 shadow-sm hover:shadow-md" 
            style={{ minWidth: 146 }}
          >
            💎 Premium
          </button>
          <button 
            onClick={() => handleQuickFilter('today')}
            className="px-6 py-2.5 rounded-lg border border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 hover:from-orange-100 hover:to-orange-200 font-medium transition-all duration-200 shadow-sm hover:shadow-md" 
            style={{ minWidth: 146 }}
          >
            📅 Today&apos;s Entries
          </button>
        </div>
        
        {/* Sort Controls */}
        <div className="mt-6">
          <SortControls
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onClearSort={handleClearSort}
            className="mx-auto max-w-4xl"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-center mt-4 gap-4">
          <BulkUploadButton />
          <button 
            onClick={() => setShowAddForm(true)} 
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            <FaPlus className="w-4 h-4" /> Add Property
          </button>
          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
            <div className={`w-3 h-3 rounded-full ${
              realtimeStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
              realtimeStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-700 font-medium">
              {realtimeStatus === 'connected' ? '🟢 Live' : 
               realtimeStatus === 'connecting' ? '🟡 Connecting...' : '🔴 Disconnected'}
            </span>
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
        <div className="mt-8 mx-4">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[1600px]">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-20">
                      Serial #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-28">Property ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-40">Property Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-48">Special Note</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-28">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-40">Owner Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-32">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-56">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-32">Area</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-40">Sub Property Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-28">Size (sq ft)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-32">Furnishing</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-32">Availability</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-24">Floor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-40">Tenant Preference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-24">Age</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-32">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-28">Deposit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-48">Additional Details</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-28">Rent/Sold Out?</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-20 sticky right-20 bg-gradient-to-r from-slate-800 to-slate-700 z-10">Edit</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-20 sticky right-0 bg-gradient-to-r from-slate-800 to-slate-700 z-10">Delete</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={22} className="px-6 py-12 text-center text-gray-500 text-sm">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span>Loading properties...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={22} className="px-6 py-12 text-center text-red-500 text-sm">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <span className="text-red-600">⚠️ Error: {error}</span>
                        </div>
                      </td>
                    </tr>
                  ) : propertyData.length === 0 ? (
                    <tr>
                      <td colSpan={22} className="px-6 py-12 text-center text-gray-500 text-sm">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <span className="text-gray-400">📋 No properties found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    propertyData.map((property, index) => (
                      <tr key={property.serial_number} className={`text-gray-900 hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-4 py-3 border-r border-gray-200 text-center">
                          <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">#{property.serial_number}</span>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200 text-center">
                          <span className="font-mono text-sm text-blue-600 font-medium">{property.property_id}</span>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200 text-center">
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            property.property_type === 'Res_resale' ? 'bg-blue-100 text-blue-800' :
                            property.property_type === 'Res_rental' ? 'bg-green-100 text-green-800' :
                            property.property_type === 'Com_resale' ? 'bg-purple-100 text-purple-800' :
                            property.property_type === 'Com_rental' ? 'bg-orange-100 text-orange-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {property.property_type === 'Res_resale' ? 'Residential Resale' :
                             property.property_type === 'Res_rental' ? 'Residential Rental' :
                             property.property_type === 'Com_resale' ? 'Commercial Resale' :
                             property.property_type === 'Com_rental' ? 'Commercial Rental' : 
                             property.property_type || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200 align-top">
                          <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                            {property.special_note ? (
                              <span className="whitespace-pre-line break-words">{property.special_note}</span>
                            ) : (
                              <span className="text-gray-400 italic">No notes</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200 text-center">
                          <span className="text-sm text-gray-600">
                            {property.date_stamp ? new Date(property.date_stamp).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            }) : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm font-semibold text-gray-900 max-w-xs overflow-hidden">
                            {property.owner_name || <span className="text-gray-400 italic">No name</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                            {property.owner_contact ? (
                              <a href={`tel:${property.owner_contact}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                {property.owner_contact}
                              </a>
                            ) : (
                              <span className="text-gray-400 italic">No contact</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                            <span className="whitespace-pre-line break-words">{property.address}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <span className="inline-block px-2 py-1 text-sm font-medium bg-amber-100 text-amber-800 rounded">
                            {property.area}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                            <span className="whitespace-pre-line break-words">{property.sub_property_type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200 text-center">
                          <span className="inline-block px-2 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded">
                            {property.size || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                            <span className="whitespace-pre-line break-words">{property.furnishing_status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <span className="inline-block px-2 py-1 text-sm font-medium bg-green-100 text-green-800 rounded">
                            {property.availability}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200 text-center">
                          <span className="text-sm text-gray-700">{property.floor}</span>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                            <span className="whitespace-pre-line break-words">{property.tenant_preference}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200 text-center">
                          <span className="text-sm text-gray-700">{property.age}</span>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm font-bold text-green-600 max-w-xs overflow-hidden">
                            <span className="whitespace-pre-line break-words">{property.rent_or_sell_price}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                            <span className="whitespace-pre-line break-words">{property.deposit}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                            {property.additional_details ? (
                              <span className="whitespace-pre-line break-words">{property.additional_details}</span>
                            ) : (
                              <span className="text-gray-400 italic">No details</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200 text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={Boolean(property.rent_sold_out)}
                              readOnly
                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200 text-center sticky right-20 bg-inherit z-10">
                          <button
                            onClick={() => {
                              setSelectedRow(property.serial_number);
                              setShowEditModal(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            title="Edit Property"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center sticky right-0 bg-inherit z-10">
                          <button
                            onClick={() => {
                              setSelectedRow(property.serial_number);
                              setShowDeleteModal(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                            title="Delete Property"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <div className="mt-6 mx-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <Pagination
                currentPage={currentPage}
                totalItems={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                className="flex justify-center"
              />
              <div className="mt-3 text-center text-sm text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} properties
              </div>
            </div>
          </div>
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