import React from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import { ADR } from '../types/adr';
import { GitStatus } from './GitStatus';
import { markdownService } from '../services/markdownService';

interface DashboardProps {
  adrs: ADR[];
  gitStatus: any;
  onRefreshGitStatus: () => void;
  onExportRepository: () => Promise<string>;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  adrs, 
  gitStatus, 
  onRefreshGitStatus, 
  onExportRepository 
}) => {
  const handleExport = async () => {
    try {
      const exportData = await onExportRepository();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adr-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du repository');
    }
  };

  const handleGenerateMarkdown = (adr: ADR, e: React.MouseEvent) => {
    e.stopPropagation();
    const markdown = markdownService.generateADRMarkdown(adr);
    markdownService.downloadMarkdown(adr, markdown);
  };

  const stats = {
    total: adrs.length,
    accepted: adrs.filter(adr => adr.status === 'accepted').length,
    proposed: adrs.filter(adr => adr.status === 'proposed').length,
    deprecated: adrs.filter(adr => adr.status === 'deprecated').length,
    draft: adrs.filter(adr => adr.status === 'draft').length,
  };

  const recentADRs = adrs
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'proposed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'deprecated': return 'text-red-600 bg-red-50 border-red-200';
      case 'superseded': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your Architecture Decision Records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total ADRs" value={stats.total} icon={FileText} color="text-slate-600" />
        <StatCard title="Accepted" value={stats.accepted} icon={CheckCircle} color="text-green-600" />
        <StatCard title="Proposed" value={stats.proposed} icon={Clock} color="text-blue-600" />
        <StatCard title="Draft" value={stats.draft} icon={FileText} color="text-slate-600" />
        <StatCard title="Deprecated" value={stats.deprecated} icon={AlertTriangle} color="text-red-600" />
      </div>

      {/* Recent ADRs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Recent ADRs</h2>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {recentADRs.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No ADRs yet. Create your first ADR to get started!</p>
            </div>
          ) : (
            recentADRs.map(adr => (
              <div key={adr.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">ADR-{adr.id} - {adr.title}</h3>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{adr.context}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span>by {adr.author}</span>
                      <span>par {adr.authors?.[0]?.name || 'Inconnu'}</span>
                      <span>•</span>
                      <span>v{adr.version}</span>
                      <span>•</span>
                      <span>{new Date(adr.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {adr.status === 'accepted' && (
                      <button
                        onClick={(e) => handleGenerateMarkdown(adr, e)}
                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Générer Markdown"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(adr.status)}`}>
                      {adr.status.charAt(0).toUpperCase() + adr.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

        {/* Git Status */}
        <div className="xl:col-span-1">
          <GitStatus
            gitStatus={gitStatus}
            onRefresh={onRefreshGitStatus}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
};