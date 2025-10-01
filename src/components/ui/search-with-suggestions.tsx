import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSearchCache } from '@/hooks/use-search-cache';

export interface SearchSuggestion {
  id: string;
  text: string;
  type?: 'name' | 'email' | 'role';
}

export interface SearchWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: SearchSuggestion[];
  placeholder?: string;
  className?: string;
  maxSuggestions?: number;
  minCharacters?: number; // Minimum characters before showing suggestions
  onSearch?: (query: string) => Promise<SearchSuggestion[]>; // Optional async search function
}

export const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = ({
  value,
  onChange,
  suggestions,
  placeholder = "Search...",
  className,
  maxSuggestions = 5,
  minCharacters = 2,
  onSearch
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [asyncSuggestions, setAsyncSuggestions] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Initialize cache for search results
  const searchCache = useSearchCache<SearchSuggestion[]>({
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxSize: 50 // Store up to 50 search results
  });

  // Async search function with caching and request cancellation
  const performAsyncSearch = useCallback(async (query: string) => {
    if (!onSearch || query.length < minCharacters) {
      setAsyncSuggestions([]);
      return;
    }

    // Check cache first
    const cacheKey = `search_${query.toLowerCase()}`;
    const cachedResults = searchCache.get(cacheKey);
    if (cachedResults) {
      setAsyncSuggestions(cachedResults);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const results = await onSearch(query);
      
      // Cache the results
      searchCache.set(cacheKey, results);
      setAsyncSuggestions(results);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Search error:', error);
        setAsyncSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onSearch, minCharacters, searchCache]);

  // Optimized filtering with fuzzy matching and relevance scoring
  const getRelevanceScore = useCallback((suggestion: SearchSuggestion, query: string): number => {
    if (!suggestion || !suggestion.text || !query) return 0;
    
    const text = suggestion.text.toLowerCase();
    const searchQuery = query.toLowerCase();
    
    // Exact match gets highest score
    if (text === searchQuery) return 100;
    
    // Starts with query gets high score
    if (text.startsWith(searchQuery)) return 90;
    
    // Contains query as whole word gets medium-high score
    const wordBoundaryRegex = new RegExp(`\\b${searchQuery}\\b`);
    if (wordBoundaryRegex.test(text)) return 80;
    
    // Contains query gets medium score
    if (text.includes(searchQuery)) return 70;
    
    // Fuzzy matching for typos (simple Levenshtein distance)
    const distance = getLevenshteinDistance(text, searchQuery);
    const maxLength = Math.max(text.length, searchQuery.length);
    const similarity = (maxLength - distance) / maxLength;
    
    return similarity > 0.6 ? similarity * 60 : 0;
  }, []);

  // Simple Levenshtein distance calculation
  const getLevenshteinDistance = useCallback((str1: string, str2: string): number => {
    if (!str1 || !str2) return Math.max(str1?.length || 0, str2?.length || 0);
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }, []);

  // Filter suggestions based on input value with optimized algorithm
  const allSuggestions = onSearch ? asyncSuggestions : suggestions;
  const filteredSuggestions = React.useMemo(() => {
    if (!value || value.length < minCharacters) return [];
    
    // Ensure allSuggestions is an array before calling map
    if (!Array.isArray(allSuggestions)) return [];
    
    return allSuggestions
      .map(suggestion => ({
        ...suggestion,
        relevanceScore: getRelevanceScore(suggestion, value)
      }))
      .filter(suggestion => suggestion.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxSuggestions);
  }, [allSuggestions, value, minCharacters, maxSuggestions, getRelevanceScore]);

  // Show suggestions only if minimum character threshold is met
  const shouldShowSuggestions = value.length >= minCharacters;

  // Handle input focus
  const handleFocus = () => {
    if (shouldShowSuggestions) {
      setIsOpen(true);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow for suggestion clicks
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  // Handle input change with debounced async search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length >= minCharacters) {
      setIsOpen(true);
      // Trigger async search if available
      if (onSearch) {
        performAsyncSearch(newValue);
      }
    } else {
      setIsOpen(false);
      setAsyncSuggestions([]);
    }
    
    setSelectedIndex(-1);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !filteredSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle clear button
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update dropdown visibility based on suggestions and minimum characters
  useEffect(() => {
    setIsOpen(shouldShowSuggestions && document.activeElement === inputRef.current);
  }, [shouldShowSuggestions]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getSuggestionTypeColor = (type?: string) => {
    switch (type) {
      case 'name':
        return 'text-blue-600';
      case 'email':
        return 'text-green-600';
      case 'role':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSuggestionTypeLabel = (type?: string) => {
    switch (type) {
      case 'name':
        return 'Name';
      case 'email':
        return 'Email';
      case 'role':
        return 'Role';
      default:
        return '';
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading && (
            <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Searching...
            </div>
          )}
          
          {!isLoading && (!filteredSuggestions || filteredSuggestions.length === 0) && value.length >= minCharacters && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No suggestions found
            </div>
          )}
          
          {!isLoading && filteredSuggestions && filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50",
                selectedIndex === index && "bg-gray-100"
              )}
            >
              <span className="text-sm text-gray-900">{suggestion.text}</span>
              {suggestion.type && (
                <span className={cn("text-xs font-medium", getSuggestionTypeColor(suggestion.type))}>
                  {getSuggestionTypeLabel(suggestion.type)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { SearchSuggestion };