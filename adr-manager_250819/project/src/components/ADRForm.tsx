import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Minus, Users, Shield, Settings, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { ADR, Author, Reviewer, Alternative, ConformityItem } from '../types/adr';

interface ADRFormProps {
  adr?: ADR | null;
  onSave: (adrData: any, changeDescription?: string) => void;
  onCancel: () => void;
}

export const ADRForm: React.FC<ADRFormProps> = ({ adr, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'proposed' as const,
    date: new Date().toISOString().split('T')[0],
    version: '1.0',
    authors: [{ name: '', role: '', team: '' }] as Author[],
    reviewers: [] as Reviewer[],
    tags: [] as string[],
    supersedes: [] as string[],
    related: [] as string[],
    
    context: '',
    problem: '',
    decision: '',
    alternatives: [{ name: '', advantages: '', disadvantages: '', rejectionReason: '' }] as Alternative[],
    justification: '',
    positiveConsequences: '',
    negativeConsequences: '',
    security: '',
    operability: '',
    implementationPlan: '',
    impact: '',
    conformity: [
      { criterion: 'Cadre de cohérence technique', status: 'todo' as const, comment: '' },
      { criterion: 'Sécurité (PSSI)', status: 'todo' as const, comment: '' },
      { criterion: 'Urbanisation (SAU)', status: 'todo' as const, comment: '' },
      { criterion: 'Interopérabilité / Référentiels', status: 'todo' as const, comment: '' },
      { criterion: 'Conformité réglementaire (RGPD)', status: 'todo' as const, comment: '' }
    ] as ConformityItem[],
    monitoring: '',
    appendices: ''
  });

  const [newTag, setNewTag] = useState('');
  const [changeDescription, setChangeDescription] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (adr) {
      setFormData({
        title: adr.title,
        slug: adr.slug,
        status: adr.status,
        date: adr.date,
        version: adr.version,
        authors: [...adr.authors],
        reviewers: [...adr.reviewers],
        tags: [...adr.tags],
        supersedes: [...adr.supersedes],
        related: [...adr.related],
        context: adr.context,
        problem: adr.problem,
        decision: adr.decision,
        alternatives: [...adr.alternatives],
        justification: adr.justification,
        positiveConsequences: adr.positiveConsequences,
        negativeConsequences: adr.negativeConsequences,
        security: adr.security,
        operability: adr.operability,
        implementationPlan: adr.implementationPlan,
        impact: adr.impact,
        conformity: [...adr.conformity],
        monitoring: adr.monitoring,
        appendices: adr.appendices
      });
    }
  }, [adr]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adr && changeDescription.trim()) {
      onSave(formData, changeDescription);
    } else {
      onSave(formData);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, { name: '', role: '', team: '' }]
    }));
  };

  const removeAuthor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }));
  };

  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.map((author, i) => 
        i === index ? { ...author, [field]: value } : author
      )
    }));
  };

  const addReviewer = () => {
    setFormData(prev => ({
      ...prev,
      reviewers: [...prev.reviewers, { name: '', role: '', team: '' }]
    }));
  };

  const removeReviewer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reviewers: prev.reviewers.filter((_, i) => i !== index)
    }));
  };

  const updateReviewer = (index: number, field: keyof Reviewer, value: string) => {
    setFormData(prev => ({
      ...prev,
      reviewers: prev.reviewers.map((reviewer, i) => 
        i === index ? { ...reviewer, [field]: value } : reviewer
      )
    }));
  };

  const addAlternative = () => {
    setFormData(prev => ({
      ...prev,
      alternatives: [...prev.alternatives, { name: '', advantages: '', disadvantages: '', rejectionReason: '' }]
    }));
  };

  const removeAlternative = (index: number) => {
    setFormData(prev => ({
      ...prev,
      alternatives: prev.alternatives.filter((_, i) => i !== index)
    }));
  };

  const updateAlternative = (index: number, field: keyof Alternative, value: string) => {
    setFormData(prev => ({
      ...prev,
      alternatives: prev.alternatives.map((alt, i) => 
        i === index ? { ...alt, [field]: value } : alt
      )
    }));
  };

  const updateConformity = (index: number, field: keyof ConformityItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      conformity: prev.conformity.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: FileText },
    { id: 'content', label: 'Contenu', icon: FileText },
    { id: 'analysis', label: 'Analyse', icon: AlertTriangle },
    { id: 'implementation', label: 'Mise en œuvre', icon: Settings },
    { id: 'conformity', label: 'Conformité', icon: CheckCircle }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {adr ? `Modifier l'ADR-${adr.id}` : 'Créer un nouvel ADR'}
          </h1>
          <p className="text-slate-600">
            {adr ? `Mettre à jour l'Architecture Decision Record ${adr.id}` : 'Documenter une nouvelle décision architecturale'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Onglets */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Onglet Général */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations générales</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre explicite de la décision"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="titre-decision"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Statut *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="proposed">Proposée</option>
                    <option value="accepted">Acceptée</option>
                    <option value="rejected">Rejetée</option>
                    <option value="superseded">Supplantée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Version *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1.0"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    L'ID sera généré automatiquement au format {new Date().getFullYear()}-NNNN
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="sécurité, fiabilité, coût..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Auteurs */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Auteurs</span>
                </h3>
                <button
                  type="button"
                  onClick={addAuthor}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.authors.map((author, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-slate-200 rounded-lg">
                    <input
                      type="text"
                      value={author.name}
                      onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Prénom Nom"
                    />
                    <input
                      type="text"
                      value={author.role}
                      onChange={(e) => updateAuthor(index, 'role', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Architecte Cloud"
                    />
                    <input
                      type="text"
                      value={author.team}
                      onChange={(e) => updateAuthor(index, 'team', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="DSI / Plateforme"
                    />
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviewers */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Reviewers</span>
                </h3>
                <button
                  type="button"
                  onClick={addReviewer}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.reviewers.map((reviewer, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-slate-200 rounded-lg">
                    <input
                      type="text"
                      value={reviewer.name}
                      onChange={(e) => updateReviewer(index, 'name', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Prénom Nom"
                    />
                    <input
                      type="text"
                      value={reviewer.role}
                      onChange={(e) => updateReviewer(index, 'role', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Sécurité"
                    />
                    <input
                      type="text"
                      value={reviewer.team}
                      onChange={(e) => updateReviewer(index, 'team', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="RSSI"
                    />
                    <button
                      type="button"
                      onClick={() => removeReviewer(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Contenu */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contexte *
              </label>
              <textarea
                required
                rows={4}
                value={formData.context}
                onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Décrire le contexte (projet, organisation, enjeux techniques/métiers/réglementaires)..."
              />
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Problématique *
              </label>
              <textarea
                required
                rows={4}
                value={formData.problem}
                onChange={(e) => setFormData(prev => ({ ...prev, problem: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Formuler le problème ou besoin à résoudre..."
              />
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Décision *
              </label>
              <textarea
                required
                rows={4}
                value={formData.decision}
                onChange={(e) => setFormData(prev => ({ ...prev, decision: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="La solution retenue, énoncée de manière claire..."
              />
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Justification *
              </label>
              <textarea
                required
                rows={4}
                value={formData.justification}
                onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Pourquoi ce choix est le meilleur compromis..."
              />
            </div>
          </div>
        )}

        {/* Onglet Analyse */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Alternatives */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Alternatives étudiées</h3>
                <button
                  type="button"
                  onClick={addAlternative}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.alternatives.map((alternative, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={alternative.name}
                        onChange={(e) => updateAlternative(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nom de l'alternative"
                      />
                      <button
                        type="button"
                        onClick={() => removeAlternative(index)}
                        className="ml-4 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <textarea
                        rows={3}
                        value={alternative.advantages}
                        onChange={(e) => updateAlternative(index, 'advantages', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Avantages"
                      />
                      <textarea
                        rows={3}
                        value={alternative.disadvantages}
                        onChange={(e) => updateAlternative(index, 'disadvantages', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Inconvénients"
                      />
                      <textarea
                        rows={3}
                        value={alternative.rejectionReason}
                        onChange={(e) => updateAlternative(index, 'rejectionReason', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Raisons du rejet"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conséquences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ✅ Conséquences positives
                </label>
                <textarea
                  rows={4}
                  value={formData.positiveConsequences}
                  onChange={(e) => setFormData(prev => ({ ...prev, positiveConsequences: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Bénéfices attendus : fiabilité, sécurité, coûts maîtrisés..."
                />
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ⚠️ Conséquences négatives / Limites
                </label>
                <textarea
                  rows={4}
                  value={formData.negativeConsequences}
                  onChange={(e) => setFormData(prev => ({ ...prev, negativeConsequences: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Risques identifiés et mesures d'atténuation..."
                />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                🛡️ Sécurité
              </label>
              <textarea
                rows={4}
                value={formData.security}
                onChange={(e) => setFormData(prev => ({ ...prev, security: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Impact sur la gestion des identités, secrets, conformité PSSI..."
              />
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ⚙️ Opérabilité & SRE
              </label>
              <textarea
                rows={4}
                value={formData.operability}
                onChange={(e) => setFormData(prev => ({ ...prev, operability: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Observabilité, scalabilité, haute disponibilité, exploitabilité..."
              />
            </div>
          </div>
        )}

        {/* Onglet Mise en œuvre */}
        {activeTab === 'implementation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                📋 Plan de mise en œuvre
              </label>
              <textarea
                rows={6}
                value={formData.implementationPlan}
                onChange={(e) => setFormData(prev => ({ ...prev, implementationPlan: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Étapes d'implémentation, découpage par phases, RACI..."
              />
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                📊 Impact
              </label>
              <textarea
                rows={6}
                value={formData.impact}
                onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Équipes impactées, services affectés, coûts, impacts réglementaires..."
              />
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                📈 Suivi et évolutivité
              </label>
              <textarea
                rows={4}
                value={formData.monitoring}
                onChange={(e) => setFormData(prev => ({ ...prev, monitoring: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Hypothèses critiques, conditions de révision, points de veille..."
              />
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                📎 Appendices
              </label>
              <textarea
                rows={4}
                value={formData.appendices}
                onChange={(e) => setFormData(prev => ({ ...prev, appendices: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Références, liens externes, diagrammes..."
              />
            </div>
          </div>
        )}

        {/* Onglet Conformité */}
        {activeTab === 'conformity' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Grille de conformité</h3>
              
              <div className="space-y-4">
                {formData.conformity.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="font-medium text-slate-700">{item.criterion}</span>
                    </div>
                    <select
                      value={item.status}
                      onChange={(e) => updateConformity(index, 'status', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ok">✅ OK</option>
                      <option value="todo">⬜ À traiter</option>
                    </select>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={item.comment}
                        onChange={(e) => updateConformity(index, 'comment', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Commentaire"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Change Description for Updates */}
        {adr && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description des modifications *
            </label>
            <textarea
              required
              rows={2}
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Décrire les modifications apportées à cette version..."
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{adr ? 'Mettre à jour l\'ADR' : 'Créer l\'ADR'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};