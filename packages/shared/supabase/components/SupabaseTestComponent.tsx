"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../index';

interface StringEntry {
  id: number;
  value: string;
}

export default function SupabaseTestComponent() {
  const [strings, setStrings] = useState<StringEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch strings from Supabase
  const fetchStrings = async () => {
    try {
      const { data, error } = await supabase
        .from('strings')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      setStrings(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Add new string to Supabase
  const addString = async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('strings')
        .insert([{ value: inputValue }]);
      
      if (error) throw error;
      
      setInputValue('');
      await fetchStrings(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load strings on component mount
  useEffect(() => {
    fetchStrings();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto mt-8" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>Supabase Test</h3>
      
      {/* Input Section */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a value..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#d1d5db' }}
            onKeyPress={(e) => e.key === 'Enter' && addString()}
          />
          <button
            onClick={addString}
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: isLoading || !inputValue.trim() ? '#9ca3af' : '#2563eb',
              color: '#ffffff',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && inputValue.trim()) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && inputValue.trim()) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
              }
            }}
          >
            {isLoading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626' }}>
          Error: {error}
        </div>
      )}

      {/* Strings List */}
      <div>
        <h4 className="font-medium mb-2" style={{ color: '#374151' }}>Stored Values:</h4>
        {strings.length === 0 ? (
          <p className="text-sm" style={{ color: '#6b7280' }}>No values stored yet.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {strings.map((string) => (
              <div
                key={string.id}
                className="p-3 rounded border"
                style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
              >
                <div className="text-sm" style={{ color: '#6b7280' }}>ID: {string.id}</div>
                <div className="font-medium" style={{ color: '#1f2937' }}>{string.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
