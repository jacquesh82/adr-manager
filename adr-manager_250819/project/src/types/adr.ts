export interface Author {
  name: string;
  role: string;
  team: string;
}

export interface Reviewer {
  name: string;
  role: string;
  team: string;
}

export interface Alternative {
  name: string;
  advantages: string;
  disadvantages: string;
  rejectionReason: string;
}

export interface ConformityItem {
  criterion: string;
  status: 'ok' | 'todo';
  comment: string;
}

export interface ADR {
  id: string;
  title: string;
  slug: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'superseded';
  date: string;
  version: string;
  authors: Author[];
  reviewers: Reviewer[];
  tags: string[];
  supersedes: string[];
  related: string[];
  
  // Contenu principal
  context: string;
  problem: string;
  decision: string;
  alternatives: Alternative[];
  justification: string;
  positiveConsequences: string;
  negativeConsequences: string;
  security: string;
  operability: string;
  implementationPlan: string;
  impact: string;
  conformity: ConformityItem[];
  monitoring: string;
  appendices: string;
  
  // Métadonnées système
  history: ADRVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ADRVersion {
  version: string;
  date: string;
  author: string;
  changes: string;
  snapshot: Omit<ADR, 'history'>;
}

export interface ADRFilter {
  search: string;
  status: string;
  author: string;
  tags: string[];
  dateFrom: string;
  dateTo: string;
}