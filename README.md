# 🔌 Plateforme de Réservation de Bornes de Recharge

Plateforme web multi-marques pour la réservation de bornes de recharge de voitures électriques.

## 🚗 Marques Supportées
- Tesla
- BYD
- Volkswagen

## ✨ Fonctionnalités

### 1. Identification du Véhicule
- **OCR Intégré**: Reconnaissance automatique de la plaque d'immatriculation (Tesseract.js)
- **Saisie Manuelle**: Alternative manuelle pour les cas d'erreur
- **Support International**: Détection des plaques étrangères

### 2. Interface Personnalisée par Marque
- Thème et couleurs adapté à chaque marque
- Logos et branding spécifiques
- UX optimisée par marque

### 3. Réservation de Borne
- Sélection de la station de recharge
- Choix du créneau horaire disponible
- Confirmation de réservation

### 4. Authentification & Sécurité
- **Keycloak**: Gestion centralisée des identités (Docker)
- **OTP**: Vérification via email ou SMS
- Multi-authentification

### 5. Notifications
- Confirmation par email/SMS
- Rappels avant réservation
- Gestion des contacts multiples

## 📁 Structure du Projet

```
bornes-recharge/
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages du flux
│   │   ├── services/      # Services API
│   │   ├── utils/         # Utilitaires OCR, thèmes
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
├── backend/               # Node.js + Express
│   ├── src/
│   │   ├── routes/        # Routes API
│   │   ├── controllers/   # Logique métier
│   │   ├── models/        # Modèles DB
│   │   ├── middleware/    # Auth, validation
│   │   └── config/        # Configuration
│   ├── package.json
│   └── Dockerfile
├── docker/                # Orchestration
│   ├── docker-compose.yml # Keycloak + DB + App
│   ├── keycloak/          # Config Keycloak
│   └── postgres/          # Init DB
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md    # Architecture système
│   ├── OCR_GUIDE.md       # Guide OCR
│   ├── KEYCLOAK_SETUP.md  # Configuration Keycloak
│   └── API.md             # Endpoints API
└── .github/
    └── copilot-instructions.md
```

## 🚀 Démarrage Rapide

### Prérequis
- Docker & Docker Compose
- Node.js 18+
- npm ou yarn

### Installation

```bash
# Cloner et naviguer
git clone <repo>
cd bornes-recharge

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Docker Compose (Keycloak + PostgreSQL)
cd ../docker
docker-compose up -d
```

### Développement

```bash
# Terminal 1: Backend (port 5000)
cd backend
npm run dev

# Terminal 2: Frontend (port 3000)
cd frontend
npm run dev

# Keycloak sera accessible à http://localhost:8080
```

### Variables d'Environnement

**Backend** (`.env`):
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/bornes_db
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=bornes-recharge
KEYCLOAK_CLIENT_ID=bornes-app
KEYCLOAK_CLIENT_SECRET=your_secret
```

**Frontend** (`.env`):
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=bornes-recharge
REACT_APP_KEYCLOAK_CLIENT_ID=bornes-app
```

## 📚 Documentation

- [Architecture Système](./docs/ARCHITECTURE.md)
- [Guide OCR](./docs/OCR_GUIDE.md)
- [Configuration Keycloak](./docs/KEYCLOAK_SETUP.md)
- [API Endpoints](./docs/API.md)

## 🏗️ Architecture

```
┌─────────────────┐
│   React SPA     │
│  (OCR + UI)     │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────┐
│  Express Backend    │
│  (Port 5000)        │
├─────────────────────┤
│ - Routes API        │
│ - Auth (Keycloak)   │
│ - OTP               │
│ - Réservations      │
└────────┬────────────┘
         │
    ┌────┴────────────┐
    │                 │
    ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │  Keycloak    │
│  (Réservs)   │  │  (Auth)      │
└──────────────┘  └──────────────┘
```

## 🔐 Flux d'Authentification

1. ✅ Identification du véhicule (OCR/Manuel)
2. ✅ Thème adapté à la marque appliqué
3. ✅ Sélection de station + créneau
4. ✅ **Redirection Keycloak** (Login/Signup)
5. ✅ Saisie email(s) + téléphone(s)
6. ✅ OTP envoyé (email ou SMS sélectionné)
7. ✅ Vérification OTP
8. ✅ **Confirmation de réservation**

## 📞 Support Multi-Contact

- Jusqu'à 3 emails
- Jusqu'à 2 numéros de téléphone
- Sélection du canal pour OTP
- Mise à jour possible après réservation

## 🔧 Technologies

| Layer | Tech |
|-------|------|
| Frontend | React 18, Tailwind CSS, Tesseract.js |
| Backend | Node.js, Express.js, JWT |
| Database | PostgreSQL 14+ |
| Auth | Keycloak 21+ |
| Deployment | Docker Compose |
| OCR | Tesseract.js + Tesseract worker |

## 📜 Licence

MIT

## 👥 Contributeurs

À venir

---

**Status**: 🔨 En développement  
**Dernière mise à jour**: Avril 2026
"# projetChtioui" 
