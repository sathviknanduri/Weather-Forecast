import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { WeatherService } from '@/services/weatherService';

interface SearchBarProps {
  onLocationSelect: (location: string) => void;
  onCurrentLocation: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onLocationSelect, 
  onCurrentLocation, 
  placeholder = "Search for a city..." 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCities = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await WeatherService.searchCities(query);
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching cities:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCities, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleLocationSelect = (location: any) => {
    const locationQuery = location.state 
      ? `${location.name}, ${location.state}, ${location.country}`
      : `${location.name}, ${location.country}`;
    setQuery(locationQuery);
    setShowSuggestions(false);
    onLocationSelect(locationQuery);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onLocationSelect(query.trim());
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={searchRef} className="relative max-w-md w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="search-glass">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="bg-transparent border-none outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={onCurrentLocation}
              className="p-1.5 rounded-lg hover:bg-muted/20 transition-colors"
              title="Use current location"
            >
              <MapPin className="w-4 h-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card border border-card-border/30 rounded-xl overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="skeleton h-4 w-32 mx-auto"></div>
            </div>
          ) : (
            suggestions.map((location, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(location)}
                className="w-full px-4 py-3 text-left hover:bg-muted/20 transition-colors border-b border-card-border/20 last:border-b-0 focus:outline-none focus:bg-muted/20"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {location.name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {location.state ? `${location.state}, ` : ''}{location.country}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;