import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../lib/auth-context';
import { globalSearch } from '../../lib/db';
import { SearchResultItem } from '../../types';
import { Search, X, Calendar, Users, FileText, Megaphone, MapPin, ArrowRight } from 'lucide-react';

interface GlobalSearchBarProps {
  onSelectResult: (path: string) => void;
  className?: string;
  autoFocus?: boolean;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onSelectResult,
  className = '',
  autoFocus = false,
}) => {
  const { profile, role } = useAuth();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Permission-aware query executed at database/data layer
    const searchMatches = globalSearch(query, profile, role);
    setResults(searchMatches);
  }, [query, profile, role]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResults = results.filter((r) => {
    if (categoryFilter === 'all') return true;
    return r.type === categoryFilter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'activity':
        return Calendar;
      case 'group':
        return Users;
      case 'document':
        return FileText;
      case 'announcement':
        return Megaphone;
      case 'locality':
        return MapPin;
      default:
        return Search;
    }
  };

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery('');
    onSelectResult(path);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search approved activities, groups, documents, notices..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Results Box */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl space-y-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100">
            {['all', 'activity', 'group', 'document', 'announcement', 'locality'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Results' : `${cat}s`}
              </button>
            ))}
          </div>

          {/* Results list */}
          {filteredResults.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-700">No approved information found</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Only records you are authorized to view appear in search results.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredResults.map((item) => {
                const Icon = getIcon(item.type);
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => handleSelect(item.path)}
                    className="flex w-full min-h-[44px] items-start gap-2.5 rounded-xl p-2.5 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 mt-0.5">
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono font-semibold text-slate-400">
                          {item.type}
                        </span>
                        {item.date && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-2" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
