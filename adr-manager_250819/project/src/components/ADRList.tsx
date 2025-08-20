import React, { useState } from 'react';
import { FileText, Eye, Edit2, Trash2, Calendar, User, Tag, Download } from 'lucide-react';
import { ADR } from '../types/adr';
import { markdownService } from '../services/markdownService';

interface ADRListProps {
  adrs: ADR[];
  onViewADR: (adr: ADR) => void;
  onEditADR: (adr: ADR) => void;
  onDeleteADR: (id: string) => void;
}

export const ADRList: React.FC<ADRListProps> = ({ adrs, onViewADR, onEditADR, onDeleteADR }) => {
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedADRs = [...adrs].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'proposed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'deprecated': return 'text-red-600 bg-red-50 border-red-200';
      case 'superseded': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const handleGenerateMarkdown = (adr: ADR, e: React.MouseEvent) => {
    e.stopPropagation();
    const markdown = markdownService.generateADRMarkdown(adr);
    markdownService.downloadMarkdown(adr, markdown);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">ADR List</h1>
          <p className="text-slate-600">{adrs.length} Architecture Decision Records</p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'status')}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="status">Sort by Status</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {sortedADRs.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">No ADRs found</h3>
          <p className="text-slate-500">Create your first Architecture Decision Record to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sortedADRs.map(adr => (
            <div key={adr.id} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900">ADR-{adr.id} - {adr.title}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(adr.status)}`}>
                        {adr.status.charAt(0).toUpperCase() + adr.status.slice(1)}
                      </div>
                    </div>
                    <p className="text-slate-600 mb-4 line-clamp-2">{adr.context}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {adr.status === 'accepted' && (
                      <button
                        onClick={(e) => handleGenerateMarkdown(adr, e)}
                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Générer Markdown"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => onViewADR(adr)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View ADR"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onEditADR(adr)}
                      className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Edit ADR"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this ADR?')) {
                          onDeleteADR(adr.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete ADR"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{adr.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(adr.date).toLocaleDateString()}</span>
                    </div>
                    {adr.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Tag className="w-4 h-4" />
                        <span>{adr.tags.slice(0, 2).join(', ')}{adr.tags.length > 2 ? '...' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs">
                    v{adr.version} • Mis à jour le {new Date(adr.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};