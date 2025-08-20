# ADR Manager - GitLab.com Integration

Interface moderne pour la gestion des Architecture Decision Records (ADR) avec intégration GitLab.com et authentification SAMLv2.

## 🚀 Fonctionnalités

- **Authentification SAMLv2** avec GitLab.com
- **Stockage Git** des ADR directement dans vos projets GitLab
- **Historisation complète** avec versioning Git
- **Interface moderne** avec dashboard et recherche avancée
- **Collaboration d'équipe** via GitLab

## ⚙️ Configuration

### 1. Configuration GitLab.com

1. Créez un projet sur GitLab.com pour stocker vos ADR
2. Configurez SAML dans votre groupe/organisation GitLab
3. Notez l'ID de votre projet GitLab

### 2. Variables d'environnement

Créez un fichier `.env` basé sur `.env.example` :

```bash
# Configuration SAML
VITE_SAML_ENTRY_POINT=https://gitlab.com/users/auth/saml
VITE_SAML_ISSUER=adr-manager
VITE_SAML_CALLBACK=http://localhost:5173/auth/callback

# Configuration GitLab
VITE_GITLAB_URL=https://gitlab.com
VITE_GITLAB_PROJECT_ID=votre-project-id

# Configuration de l'application
VITE_APP_NAME=ADR Manager
VITE_APP_VERSION=1.0.0
```

### 3. Configuration SAML sur GitLab.com

Dans votre groupe GitLab.com, configurez SAML avec :
- **SSO URL** : `https://gitlab.com/users/auth/saml`
- **Identifier** : `adr-manager`
- **Certificate** : Votre certificat SAML

## 🏃‍♂️ Démarrage rapide

```bash
# Installation des dépendances
npm install

# Démarrage en développement
npm run dev

# Build pour la production
npm run build
```

## 📁 Structure des ADR

Les ADR sont stockés dans votre projet GitLab sous le format :
```
adrs/
├── adr-001.json
├── adr-002.json
└── ...
```

Chaque modification génère un commit Git avec un message structuré :
```
ADR-001: CREATE Choix de l'architecture microservices
ADR-001: UPDATE Mise à jour des conséquences
```

## 🔐 Sécurité

- Authentification obligatoire via SAML
- Tokens GitLab sécurisés avec rafraîchissement automatique
- Accès basé sur les permissions GitLab du projet

## 🛠️ Technologies

- **React 18** avec TypeScript
- **Tailwind CSS** pour le design
- **GitLab API** pour le stockage
- **SAML 2.0** pour l'authentification
- **Vite** pour le build

## 📖 Utilisation

1. **Connexion** : Cliquez sur "Se connecter avec GitLab"
2. **Authentification** : Authentifiez-vous via SAML sur GitLab.com
3. **Gestion des ADR** : Créez, modifiez et consultez vos ADR
4. **Historique** : Visualisez l'historique Git de chaque ADR
5. **Collaboration** : Partagez et collaborez via GitLab

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.