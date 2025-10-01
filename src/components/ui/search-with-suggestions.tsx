import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
}

export const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = ({
  value,
  onChange,
  suggestions,
  placeholder = "Search...",
  className,
  maxSuggestions = 5
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input value
  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.text.toLowerCase().includes(value.toLowerCase()) && 
      suggestion.text.toLowerCase() !== value.toLowerCase()
    )
    .slice(0, maxSuggestions);

  // Handle input focus
  const handleFocus = () => {
    if (filteredSuggestions.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow for suggestion clicks
    setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Show dropdown if there are suggestions
    if (newValue.trim() && filteredSuggestions.length > 0) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
    }
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
    if (!isOpen || filteredSuggestions.length === 0) return;

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

  // Update dropdown visibility when suggestions change
  useEffect(() => {
    if (value.trim() && filteredSuggestions.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [filteredSuggestions.length, value]);

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

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
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