import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ADR, ADRFilter } from '../types/adr';
import { ADRList } from './ADRList';

interface SearchViewProps {
  adrs: ADR[];
  onViewADR: (adr: ADR) => void;
  onEditADR: (adr: ADR) => void;
  onDeleteADR: (id: string) => void;
  onFilter: (filter: ADRFilter) => ADR[];
}

export const SearchView: React.FC<SearchViewProps> = ({
  adrs,
  onViewADR,
  onEditADR,
  onDeleteADR,
  onFilter
}) => {
  const [filter, setFilter] = useState<ADRFilter>({
    search: '',
    status: '',
    author: '',
    tags: [],
    dateFrom: '',
    dateTo: ''
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filteredADRs, setFilteredADRs] = useState<ADR[]>(adrs);

  React.useEffect(() => {
    const results = onFilter(filter);
    setFilteredADRs(results);
  }, [filter, adrs, onFilter]);

  const clearFilters = () => {
    setFilter({
      search: '',
      status: '',
      author: '',
      tags: [],
      dateFrom: '',
      dateTo: ''
    });
  };

  const hasActiveFilters = filter.search || filter.status || filter.author || 
                          filter.tags.length > 0 || filter.dateFrom || filter.dateTo;

  const allStatuses = ['draft', 'proposed', 'accepted', 'superseded', 'deprecated'];
  const allAuthors = [...new Set(adrs.map(adr => adr.author))];
  const allTags = [...new Set(adrs.flatMap(adr => adr.tags))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Search ADRs</h1>
        <p className="text-slate-600">Find specific Architecture Decision Records</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
        {/* Main Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rechercher par ID (ex: 2025-0001), titre, contexte, décision..."
          />
        </div>

        {/* Filter Toggle and Clear */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Advanced Filters</span>
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {allStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Author
                </label>
                <select
                  value={filter.author}
                  onChange={(e) => setFilter(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Authors</option>
                  {allAuthors.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <label key={tag} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filter.tags.includes(tag)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilter(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                          } else {
                            setFilter(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Search Results
          </h2>
          <span className="text-sm text-slate-500">
            {filteredADRs.length} of {adrs.length} ADRs
          </span>
        </div>

        <ADRList
          adrs={filteredADRs}
          onViewADR={onViewADR}
          onEditADR={onEditADR}
          onDeleteADR={onDeleteADR}
        />
      </div>
    </div>
  );
};