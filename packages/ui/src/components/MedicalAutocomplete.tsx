"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';

interface Suggestion {
  code?: string;
  rxcui?: string;
  name: string;
}

interface MedicalAutocompleteProps {
  type: 'icd10' | 'rxnorm';
  placeholder?: string;
  onSelect: (value: string) => void;
  defaultValue?: string;
  className?: string;
  apiBaseUrl?: string;
}

export function MedicalAutocomplete({
  type,
  placeholder,
  onSelect,
  defaultValue = "",
  className = "",
  apiBaseUrl = "http://localhost:8000"
}: MedicalAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/clinical/search?q=${encodeURIComponent(searchTerm)}&type=${type}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSuggestions(data);
      setIsOpen(true);
    } catch (err) {
      console.error('Clinical search error:', err);
      setError('Service unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.name);
    setIsOpen(false);
    onSelect(suggestion.name);
  };

  const clearInput = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`h-4 w-4 ${isLoading ? 'text-clinical-blue' : 'text-slate-400'}`} />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder || `Search ${type === 'icd10' ? 'Diagnoses' : 'Medications'}...`}
          className="block w-full pl-9 pr-8 py-2 border border-slate-200 rounded-md bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-clinical-blue focus:border-clinical-blue transition-all text-slate-700"
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-clinical-blue" />}
          {query && !isLoading && (
            <button type="button" onClick={clearInput} className="p-1 hover:bg-slate-100 rounded-md text-slate-400 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (suggestions.length > 0 || error) && (
        <div className="absolute z-[100] mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {error ? (
            <div className="p-3 text-xs text-red-500 bg-red-50">{error}</div>
          ) : (
            <div className="py-1">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700 transition-colors flex flex-col"
                >
                  <span className="font-medium">{s.name}</span>
                  {s.code && <span className="text-[10px] text-slate-400 uppercase tracking-tight">{s.code}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
