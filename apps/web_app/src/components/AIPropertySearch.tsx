import React, { useState } from 'react';
import { PropertyData } from '@/lib/dummyProperties';
import { useAIPropertySearch } from '@/hooks/useAIPropertySearch';
import { Button } from '@/components/ui/button';

const AIPropertySearch: React.FC = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchPrompt, setSearchPrompt] = useState('');
  const [searchOptions, setSearchOptions] = useState<{
    searchType: 'basic' | 'detailed' | 'investment';
    priceRange: 'budget' | 'mid' | 'premium';
  }>({
    searchType: 'basic',
    priceRange: 'mid'
  });

  const {
    searchState,
    searchProperties,
    clearSearch
  } = useAIPropertySearch();

  const handleSearch = async () => {
    if (!searchPrompt.trim()) return;
    await searchProperties(searchPrompt, searchOptions);
  };

  const handleClearSearch = () => {
    clearSearch();
    setSearchPrompt('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  // Example prompts for user guidance
  const examplePrompts = [
    "2 BHK apartments near metro stations under 50 lakhs",
    "Spacious family homes with parking in South Delhi",
    "Budget-friendly properties for students near universities",
    "Luxury villas with swimming pool and garden",
    "Commercial spaces suitable for small businesses",
    "Properties with good investment potential in growing areas"
  ];

  if (!showSearch) {
    return (
      <div className="mb-6">
        <Button
          onClick={() => setShowSearch(true)}
          className="btn-3d bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
        >
          🔍 AI Property Search (Llama 3.1)
        </Button>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          🔍 AI Property Search (Llama 3.1)
        </h3>
        <Button
          onClick={() => setShowSearch(false)}
          variant="outline"
          size="sm"
        >
          Close
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Describe what you&apos;re looking for
          </label>
          <div className="relative">
            <textarea
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., '3 BHK apartment near metro station with parking under 80 lakhs' or 'Affordable housing for young professionals in tech hubs'"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
              rows={3}
              disabled={searchState.isSearching}
            />
            <div className="absolute bottom-2 right-2 text-xs text-white/40">
              Press Enter to search
            </div>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="mb-4">
          <div className="text-xs text-white/60 mb-2">Try these examples:</div>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.slice(0, 3).map((example, index) => (
              <button
                key={index}
                onClick={() => setSearchPrompt(example)}
                disabled={searchState.isSearching}
                className="px-3 py-1 text-xs bg-white/5 border border-white/20 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Search Options */}
        <div className="mb-4">
          <div className="text-sm text-white/80 mb-2">Search Options:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Type */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Search Type
              </label>
              <select
                value={searchOptions.searchType}
                onChange={(e) => setSearchOptions(prev => ({ 
                  ...prev, 
                  searchType: e.target.value as 'basic' | 'detailed' | 'investment'
                }))}
                disabled={searchState.isSearching}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                <option value="basic">Basic Search</option>
                <option value="detailed">Detailed Analysis</option>
                <option value="investment">Investment Focus</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Price Range Preference
              </label>
              <select
                value={searchOptions.priceRange}
                onChange={(e) => setSearchOptions(prev => ({ 
                  ...prev, 
                  priceRange: e.target.value as 'budget' | 'mid' | 'premium'
                }))}
                disabled={searchState.isSearching}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                <option value="budget">Budget-Friendly</option>
                <option value="mid">Mid-Range</option>
                <option value="premium">Premium Properties</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSearch}
            disabled={!searchPrompt.trim() || searchState.isSearching}
            className={`px-8 py-3 text-lg font-semibold ${
              !searchPrompt.trim()
                ? 'bg-gray-500/50 cursor-not-allowed'
                : 'btn-3d bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
            } text-white`}
          >
            {searchState.isSearching ? (
              <>
                <div className="w-5 h-5 border border-white/40 border-t-white rounded-full animate-spin mr-2"></div>
                Searching Properties...
              </>
            ) : (
              <>🚀 Search Properties</>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {searchState.error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
          <div className="text-red-200 text-sm">
            <strong>Search Error:</strong> {searchState.error}
          </div>
          <div className="text-xs text-red-300 mt-2">
            Try rephrasing your search with property-related terms like location, property type, budget, or amenities.
          </div>
        </div>
      )}

      {/* Search Results */}
      {(searchState.results.length > 0 || searchState.searchCriteria || searchState.aiExplanation) && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-lg font-semibold text-white">
                Search Results ({searchState.results.length} properties found)
              </h4>
              {searchState.searchMetadata?.confidenceScore && (
                <div className="text-xs text-blue-300 mt-1">
                  AI Confidence: {Math.round(searchState.searchMetadata.confidenceScore * 100)}% • 
                  Search Type: {searchState.searchMetadata.searchType} • 
                  Price Range: {searchState.searchMetadata.priceRange}
                </div>
              )}
            </div>
            <Button
              onClick={handleClearSearch}
              variant="outline"
              size="sm"
            >
              Clear Results
            </Button>
          </div>

          {/* AI Explanation */}
          {searchState.aiExplanation && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
              <h5 className="text-sm font-medium text-blue-300 mb-2">🤖 AI Search Analysis:</h5>
              <p className="text-sm text-blue-200">{searchState.aiExplanation}</p>
            </div>
          )}

          {/* Search Criteria */}
          {searchState.searchCriteria && (
            <div className="mb-6 p-4 bg-white/5 border border-white/20 rounded-lg">
              <h5 className="text-sm font-medium text-white/80 mb-3">🎯 Applied Search Criteria:</h5>
              <div className="text-sm text-cyan-400">
                {searchState.searchCriteria}
              </div>
            </div>
          )}

          {/* Found Properties */}
          {searchState.results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {searchState.results.map((property: PropertyData) => (
                <div
                  key={property.serial_number}
                  className="p-4 rounded-lg border bg-white/5 border-white/20 hover:bg-white/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-white">
                      #{property.serial_number}
                    </div>
                    <div className="text-xs text-green-400 font-semibold">
                      AI Match
                    </div>
                  </div>
                  
                  <div className="text-sm text-white/80 mb-1">
                    {property.sub_property_type || property.property_type}
                  </div>
                  <div className="text-xs text-white/60 mb-2">
                    📍 {property.area}
                  </div>
                  <div className="text-sm font-bold text-green-400 mb-2">
                    ₹{property.rent_or_sell_price ? parseFloat(property.rent_or_sell_price).toLocaleString() : 'N/A'}
                  </div>
                  
                  {/* Key Matching Features */}
                  <div className="text-xs text-white/50">
                    {property.size && `� ${property.size}`}
                    {property.furnishing_status && ` • ${property.furnishing_status}`}
                    {property.floor && ` • Floor ${property.floor}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {searchState.results.length === 0 && searchState.searchCriteria && (
            <div className="text-center py-8">
              <div className="text-white/60 mb-2">🔍 No properties found matching your criteria</div>
              <div className="text-sm text-white/40">
                Try adjusting your search terms or expanding your budget/location preferences.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIPropertySearch;
