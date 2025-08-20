import React from 'react';
import { ArrowLeft, Edit2, Calendar, User, Tag, History, FileText, GitBranch, Users, Shield, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { ADR } from '../types/adr';
import { markdownService } from '../services/markdownService';

interface ADRViewProps {
  adr: ADR;
  onBack: () => void;
  onEdit: (adr: ADR) => void;
  onViewGitHistory: (adr: ADR) => void;
}

export const ADRView: React.FC<ADRViewProps> = ({ adr, onBack, onEdit, onViewGitHistory }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'proposed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'deprecated': return 'text-red-600 bg-red-50 border-red-200';
      case 'superseded': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const handleGenerateMarkdown = () => {
    const markdown = markdownService.generateADRMarkdown(adr);
    markdownService.downloadMarkdown(adr, markdown);
  };

  const Section = ({ title, content, icon: Icon }: any) => (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-700 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">ADR-{adr.id} - {adr.title}</h1>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(adr.status)}`}>
                {adr.status.charAt(0).toUpperCase() + adr.status.slice(1)}
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>by {adr.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(adr.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>Version {adr.version}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {adr.status === 'accepted' && (
            <button
              onClick={handleGenerateMarkdown}
              className="px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Générer Markdown</span>
            </button>
          )}
          <button
            onClick={() => onViewGitHistory(adr)}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center space-x-2"
          >
            <GitBranch className="w-5 h-5" />
            <span>Historique Git</span>
          </button>
          <button
            onClick={() => onEdit(adr)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit2 className="w-5 h-5" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Tags */}
      {adr.tags.length > 0 && (
        <div className="flex items-center space-x-3">
          <Tag className="w-5 h-5 text-slate-400" />
          <div className="flex flex-wrap gap-2">
            {adr.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Auteurs et Reviewers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adr.authors.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Auteurs</h3>
            </div>
            <div className="space-y-3">
              {adr.authors.map((author, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900">{author.name}</p>
                  <p className="text-sm text-slate-600">{author.role} - {author.team}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {adr.reviewers.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Reviewers</h3>
            </div>
            <div className="space-y-3">
              {adr.reviewers.map((reviewer, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900">{reviewer.name}</p>
                  <p className="text-sm text-slate-600">{reviewer.role} - {reviewer.team}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        <Section title="Contexte" content={adr.context} icon={FileText} />
        <Section title="Problématique" content={adr.problem} icon={AlertTriangle} />
        <Section title="Décision" content={adr.decision} icon={CheckCircle} />
        <Section title="Justification" content={adr.justification} icon={FileText} />
        
        {/* Alternatives */}
        {adr.alternatives.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Alternatives étudiées</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-medium text-slate-700">Alternative</th>
                    <th className="text-left py-2 font-medium text-slate-700">Avantages</th>
                    <th className="text-left py-2 font-medium text-slate-700">Inconvénients</th>
                    <th className="text-left py-2 font-medium text-slate-700">Raisons du rejet</th>
                  </tr>
                </thead>
                <tbody>
                  {adr.alternatives.map((alt, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-3 font-medium text-slate-900">{alt.name}</td>
                      <td className="py-3 text-slate-600">{alt.advantages}</td>
                      <td className="py-3 text-slate-600">{alt.disadvantages}</td>
                      <td className="py-3 text-slate-600">{alt.rejectionReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Conséquences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="✅ Conséquences positives" content={adr.positiveConsequences} icon={CheckCircle} />
          <Section title="⚠️ Conséquences négatives" content={adr.negativeConsequences} icon={AlertTriangle} />
        </div>

        <Section title="🛡️ Sécurité" content={adr.security} icon={Shield} />
        <Section title="⚙️ Opérabilité & SRE" content={adr.operability} icon={FileText} />
        <Section title="📋 Plan de mise en œuvre" content={adr.implementationPlan} icon={FileText} />
        <Section title="📊 Impact" content={adr.impact} icon={FileText} />
        
        {/* Conformité */}
        {adr.conformity.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Conformité</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-medium text-slate-700">Critère</th>
                    <th className="text-left py-2 font-medium text-slate-700">Statut</th>
                    <th className="text-left py-2 font-medium text-slate-700">Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {adr.conformity.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-3 font-medium text-slate-900">{item.criterion}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'ok' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {item.status === 'ok' ? '✅ OK' : '⬜ À traiter'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">{item.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Section title="📈 Suivi et évolutivité" content={adr.monitoring} icon={FileText} />
        
        {adr.appendices && (
          <Section title="📎 Appendices" content={adr.appendices} icon={FileText} />
        )}
      </div>

      {/* History */}
      {adr.history.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <History className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Version History</h3>
          </div>
          <div className="space-y-4">
            {/* Current Version */}
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {adr.version}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-900">Current Version</span>
                  <span className="text-sm text-slate-500">{new Date(adr.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-600">Latest version of this ADR</p>
              </div>
            </div>

            {/* Previous Versions */}
            {adr.history.map((version, index) => (
              <div key={version.version} className="flex items-start space-x-4 p-4 border border-slate-200 rounded-lg">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-sm font-medium">
                  {version.version}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900">Version {version.version}</span>
                    <span className="text-sm text-slate-500">{new Date(version.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{version.changes}</p>
                  <p className="text-xs text-slate-500">by {version.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="text-xs text-slate-500 space-y-1">
          <p>Created: {new Date(adr.createdAt).toLocaleString()}</p>
          <p>Last updated: {new Date(adr.updatedAt).toLocaleString()}</p>
          <p>ADR ID: {adr.id}</p>
        </div>
      </div>
    </div>
  );
};