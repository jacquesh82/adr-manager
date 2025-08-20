import { ADR } from '../types/adr';

class MarkdownService {
  generateADRMarkdown(adr: ADR): string {
    const markdown = `---
id: ${adr.id}
title: "${adr.title}"
slug: "${adr.slug}"
status: ${adr.status}
date: "${adr.date}"
version: ${adr.version}
authors:
${adr.authors.map(author => `  - name: "${author.name}"
    role: "${author.role}"
    team: "${author.team}"`).join('\n')}
reviewers:
${adr.reviewers.map(reviewer => `  - name: "${reviewer.name}"
    role: "${reviewer.role}"
    team: "${reviewer.team}"`).join('\n')}
tags: [${adr.tags.map(tag => `"${tag}"`).join(', ')}]
supersedes: [${adr.supersedes.map(id => `"${id}"`).join(', ')}]
related: [${adr.related.map(id => `"${id}"`).join(', ')}]
---

# ADR-${adr.id} - ${adr.title}

## 1. Statut
${this.getStatusText(adr.status)}

## 2. Contexte
${adr.context}

## 3. Problématique
${adr.problem}

## 4. Décision
${adr.decision}

## 5. Alternatives étudiées
${this.generateAlternativesTable(adr.alternatives)}

## 6. Justification
${adr.justification}

## 7. Conséquences
### ✅ Positives
${adr.positiveConsequences}

### ⚠️ Négatives / Limites
${adr.negativeConsequences}

## 8. Sécurité
${adr.security}

## 9. Opérabilité & SRE
${adr.operability}

## 10. Plan de mise en œuvre
${adr.implementationPlan}

## 11. Impact
${adr.impact}

## 12. Conformité
${this.generateConformityTable(adr.conformity)}

## 13. Suivi et évolutivité
${adr.monitoring}

${adr.appendices ? `## 14. Appendices
${adr.appendices}` : ''}

---
*Généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à partir de l'ADR Manager*
`;

    return markdown;
  }

  private getStatusText(status: string): string {
    switch (status) {
      case 'proposed': return 'Proposée';
      case 'accepted': return 'Validée';
      case 'rejected': return 'Rejetée';
      case 'superseded': return 'Supplantée';
      default: return status;
    }
  }

  private generateAlternativesTable(alternatives: any[]): string {
    if (!alternatives || alternatives.length === 0) {
      return 'Aucune alternative documentée.';
    }

    let table = '| Alternative | Avantages | Inconvénients | Raisons du rejet |\n';
    table += '|-------------|-----------|---------------|------------------|\n';
    
    alternatives.forEach(alt => {
      table += `| ${alt.name} | ${alt.advantages} | ${alt.disadvantages} | ${alt.rejectionReason} |\n`;
    });

    return table;
  }

  private generateConformityTable(conformity: any[]): string {
    if (!conformity || conformity.length === 0) {
      return 'Aucun critère de conformité défini.';
    }

    let table = '| Critère | OK | À traiter | Commentaire |\n';
    table += '|---------|----|-----------|-------------|\n';
    
    conformity.forEach(item => {
      const status = item.status === 'ok' ? '✅' : '⬜';
      const notStatus = item.status === 'ok' ? '⬜' : '✅';
      table += `| ${item.criterion} | ${status} | ${notStatus} | ${item.comment} |\n`;
    });

    return table;
  }

  downloadMarkdown(adr: ADR, markdown: string): void {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${adr.slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const markdownService = new MarkdownService();