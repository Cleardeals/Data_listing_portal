import React, { useState } from 'react';
import { PropertyData } from '@/lib/dummyProperties';
import { useAIPropertySearch } from '@/hooks/useAIPropertySearch';

function AIPropertySearch() {
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
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => setShowSearch(true)}
          className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] touch-manipulation text-sm sm:text-base group"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-200">🔍</span>
            <span className="font-semibold">AI Property Search</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white text-sm sm:text-base">🔍</span>
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              AI Property Search
            </h3>
            <p className="text-white/70 text-xs sm:text-sm">Natural language property discovery</p>
          </div>
        </div>
        <button
          onClick={() => setShowSearch(false)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-600/50 hover:bg-slate-500/50 text-white rounded-lg text-xs sm:text-sm transition-colors touch-manipulation self-start sm:self-auto"
        >
          Close
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs sm:text-sm font-medium text-white/80 mb-2">
            Describe what you&apos;re looking for
          </label>
          <div className="relative">
            <textarea
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., '3 BHK apartment near metro station with parking under 80 lakhs' or 'Affordable housing for young professionals in tech hubs'"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
              rows={3}
              disabled={searchState.isSearching}
            />
          </div>
        </div>

        {/* Example Prompts */}
        <div className="mb-3 sm:mb-4">
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
          <div className="text-xs sm:text-sm text-white/80 mb-2">Search Options:</div>
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
                className="w-full px-2.5 sm:px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
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
                className="w-full px-2.5 sm:px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
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
          <button
            onClick={handleSearch}
            disabled={!searchPrompt.trim() || searchState.isSearching}
            className={`px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg touch-manipulation ${
              !searchPrompt.trim()
                ? 'bg-gray-500/50 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {searchState.isSearching ? (
              <>
                <div className="w-5 h-5 border border-white/40 border-t-white rounded-full animate-spin mr-2 inline-block"></div>
                Searching Properties...
              </>
            ) : (
              <>🚀 Search Properties</>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {searchState.error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
          <div className="text-red-200 text-xs sm:text-sm">
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
            <button
              onClick={handleClearSearch}
              className="px-3 py-1.5 text-sm bg-slate-700/80 border border-white/20 text-white rounded-md hover:bg-slate-600/80 transition-colors"
            >
              Clear Results
            </button>
          </div>

          {/* AI Explanation */}
          {searchState.aiExplanation && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
              <h5 className="text-xs sm:text-sm font-medium text-blue-300 mb-2">🤖 AI Search Analysis:</h5>
              <p className="text-xs sm:text-sm text-blue-200">{searchState.aiExplanation}</p>
            </div>
          )}

          {/* Search Criteria */}
          {searchState.searchCriteria && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white/5 border border-white/20 rounded-lg">
              <h5 className="text-xs sm:text-sm font-medium text-white/80 mb-2 sm:mb-3">🎯 Applied Search Criteria:</h5>
              <div className="text-xs sm:text-sm text-cyan-400">
                {searchState.searchCriteria}
              </div>
            </div>
          )}

          {/* Found Properties */}
          {searchState.results.length > 0 && (
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto pb-4 max-h-48 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {searchState.results.map((property: PropertyData) => (
                  <div
                    key={property.serial_number}
                    className="card-hover-3d backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/40 flex-shrink-0 w-80"
                  >
                  <div className="flex flex-row h-40">
                    {/* Image/Icon Section - Left Side */}
                    <div className="w-20 h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border-r border-white/20 flex-shrink-0">
                      <div className="text-center">
                        <div className="text-2xl mb-1">
                          {property.property_type?.includes('Res') ? '🏠' : '🏢'}
                        </div>
                        <div className="text-xs text-green-400 font-semibold bg-green-500/20 px-1 py-0.5 rounded">
                          AI Match
                        </div>
                      </div>
                    </div>

                    {/* Content Section - Right Side */}
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      {/* Top Section - Title and Serial */}
                      <div>
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-xs font-semibold text-white line-clamp-1 flex-1 mr-1">
                            {property.sub_property_type || property.property_type || 'Property'}
                          </h3>
                          <span className="text-xs text-white/60 bg-white/10 px-1 py-0.5 rounded text-nowrap">
                            #{property.serial_number}
                          </span>
                        </div>

                        {/* Owner Name */}
                        {property.owner_name && (
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-yellow-400 text-xs">👤</span>
                            <span className="text-white/80 text-xs truncate">{property.owner_name}</span>
                          </div>
                        )}

                        {/* Property Details - Compact Grid */}
                        <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-blue-400 text-xs">📍</span>
                            <span className="text-white/80 truncate">{property.area || 'N/A'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-purple-400 text-xs">📐</span>
                            <span className="text-white/80 truncate">{property.size || 'N/A'}</span>
                          </div>

                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-orange-400 text-xs">🛋️</span>
                            <span className="text-white/80 truncate">{property.furnishing_status || 'N/A'}</span>
                          </div>

                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-blue-400 text-xs">ℹ️</span>
                            <span className="text-blue-400 text-xs font-medium truncate">
                              {property.availability || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section - Price and Matching Info */}
                      <div className="border-t border-white/10 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-green-400">
                              ₹{property.rent_or_sell_price ? parseFloat(property.rent_or_sell_price).toLocaleString() : 'N/A'}
                            </div>
                            <div className="text-xs text-white/60">
                              {property.property_type?.includes('rental') ? 'Per Month' : 'Total'}
                            </div>
                          </div>
                          
                          {/* AI Match Indicator */}
                          <div className="ml-2">
                            <div className="text-xs sm:text-sm text-cyan-300 font-medium">
                              🤖 AI Suggested
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
              {/* Scroll Hint */}
              {searchState.results.length > 3 && (
                <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-slate-900/80 to-transparent pointer-events-none flex items-center justify-end pr-2">
                  <div className="text-white/40 text-xs">→</div>
                </div>
              )}
            </div>
          )}

          {/* No Results Message */}
          {searchState.results.length === 0 && searchState.searchCriteria && (
            <div className="text-center py-6 sm:py-8">
              <div className="text-white/60 mb-2 text-sm sm:text-base">🔍 No properties found matching your criteria</div>
              <div className="text-xs sm:text-sm text-white/40">
                Try adjusting your search terms or expanding your budget/location preferences.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIPropertySearch;
