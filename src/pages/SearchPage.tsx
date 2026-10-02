import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { globalSearch } from '../lib/db';
import { SearchResultItem } from '../types';
import {
  Search,
  Calendar,
  Users,
  FileText,
  Megaphone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

interface SearchPageProps {
  initialQuery?: string;
  onNavigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', onNavigate }) => {
  const { profile, role, cluster } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const results = query.trim() ? globalSearch(query, profile, role) : [];

  const filteredResults = results.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.type === selectedCategory;
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-950 mb-2 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
          Global Cluster Search
        </h1>
        <p className="text-xs text-slate-600">
          Permission-aware search across activities, study groups, educational documents, and notices in {cluster?.name || 'Kimana Cluster'}.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-emerald-700/60" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search activities, study circles, guidelines, or localities..."
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
          />
        </div>

        {/* Categories Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-emerald-900/5 pt-3 text-xs">
          {['all', 'activity', 'group', 'document', 'announcement', 'locality'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-emerald-900/5 text-emerald-900 hover:bg-emerald-900/10'
              }`}
            >
              {cat === 'all' ? 'All Results' : `${cat}s`}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1 text-[11px] text-emerald-800 font-mono">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>RLS Guarded ({filteredResults.length} matches)</span>
          </div>
        </div>
      </div>

      {/* Search Results Display */}
      {query.trim().length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center space-y-2">
          <Search className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">Start typing to search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Search terms will be queried against approved activities, study groups, official guidelines, and announcements.
          </p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center space-y-2">
          <Search className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">No matching records</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No records matching &ldquo;{query}&rdquo; were found within your authorization level.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100">
          {filteredResults.map((item) => {
            const Icon = getIcon(item.type);
            return (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => onNavigate(item.path)}
                className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mt-0.5">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-400 font-semibold">
                      <span>{item.type}</span>
                      {item.date && (
                        <>
                          <span>·</span>
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 hover:text-blue-900 transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(item.path)}
                  className="shrink-0 flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <span>View</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
