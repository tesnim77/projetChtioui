# 🚀 Guide de Démarrage Rapide

## 📋 Checklist Prérequis

- ✅ Docker & Docker Compose installés
- ✅ Node.js 18+ installé
- ✅ Git configuré
- ✅ 4GB RAM minimum

## ⚡ Démarrage en 3 Étapes

### Étape 1: Lancer l'Infrastructure (Docker)

```bash
cd docker
docker-compose up -d
```

**Vérifier le statut:**
```bash
docker-compose ps
```

**Attendre que tous les services soient "healthy"** (~30-60 secondes)

**Accès:**
- 🗄️ PostgreSQL: `localhost:5432` (user: bornes_user / pass: bornes_secure_pass)
- 🔐 Keycloak: `http://localhost:8080` (user: admin / pass: admin_password)

### Étape 2: Configurer Backend

```bash
cd backend

# Copier exemple env
cp .env.example .env

# Installer dépendances
npm install

# Démarrer serveur (dev mode)
npm run dev
```

✅ Backend prêt: `http://localhost:5000`

### Étape 3: Configurer Frontend

```bash
cd ../frontend

# Copier exemple env
cp .env.example .env

# Installer dépendances
npm install

# Démarrer dev server (hot reload)
npm run dev
```

✅ Frontend prêt: `http://localhost:3000`

---

## 🧪 Test Complet du Flux

### 1️⃣ Accès Application

```
Ouvrir: http://localhost:3000
```

### 2️⃣ OCR - Identification Véhicule

```
Page: /identification
Action: 
  - Upload photo plaque (ou caméra)
  - OCR reconnaît plaque (Tesseract.js)
  - Marque détectée (Tesla/BYD/VW)
  - Thème changé
```

### 3️⃣ Sélection Station + Créneau

```
Page: /select-station
- Voir stations disponibles
- Filtrer par marque
- Voir créneaux horaires
```

### 4️⃣ Authentification Keycloak

```
Redirection: http://localhost:8080
- Créer compte ou login
- Admin credentials: admin/admin_password
```

### 5️⃣ Vérification OTP

```
Page: /confirmation
- Saisir email(s) et téléphone(s)
- Sélectionner canal OTP (email)
- Vérifier code envoyé
```

### 6️⃣ Confirmation Réservation

```
- Confirmer réservation
- Voir code confirmation
- Accèder dashboard
```

---

## 📚 Fichiers Importants À Lire

1. **[README.md](./README.md)** - Vue d'ensemble projet
2. **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Architecture système
3. **[docs/OCR_GUIDE.md](./docs/OCR_GUIDE.md)** - Guide OCR détaillé
4. **[docs/KEYCLOAK_SETUP.md](./docs/KEYCLOAK_SETUP.md)** - Configuration Keycloak
5. **[docs/API.md](./docs/API.md)** - API Endpoints

---

## 🔧 Commandes Utiles

### Frontend
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
```

### Backend
```bash
cd backend
npm run dev      # Start avec nodemon
npm start        # Start production
npm run migrate  # Run DB migrations
```

### Docker
```bash
cd docker
docker-compose up -d          # Démarrer en background
docker-compose down           # Arrêter tout
docker-compose logs -f        # Voir logs
docker-compose restart        # Redémarrer services
```

---

## 🐛 Troubleshooting

### Keycloak ne répond pas
```bash
# Vérifier logs
docker logs bornes_keycloak

# Attendre ~30 sec et vérifier santé
curl http://localhost:8080/health/live
```

### Backend erreur de DB
```bash
# Vérifier connexion PostgreSQL
psql postgresql://bornes_user:bornes_secure_pass@localhost:5432/bornes_recharge_db

# Re-initialiser DB
docker-compose restart postgres
```

### Frontend port 3000 occupé
```bash
# Changer port dans vite.config.js
# Ou tuer processus:
lsof -i :3000
kill -9 PID
```

### Erreur CORS frontend → backend
```bash
# Vérifier CORS dans backend/src/server.js
# CLIENT_URL doit matcher http://localhost:3000
```

---

## 📊 Statut Développement

| Composant | Status | Notes |
|-----------|--------|-------|
| Infrastructure | ✅ Ready | Docker Compose configuré |
| Auth (Keycloak) | ✅ Ready | Realm + client créés |
| DB (PostgreSQL) | ✅ Ready | Schéma initial |
| Backend Base | ✅ Ready | Express + routes stubs |
| Frontend Base | ✅ Ready | React + routing stubs |
| **OCR (Tesseract)** | 🔨 **NEXT** | À implémenter |
| API Endpoints | 🔨 In Progress | Stubs créés |
| UI/UX Complets | 🔨 In Progress | À développer |

---

## 🎯 Prochaines Étapes

1. **Développer OCR** - Voir [docs/OCR_GUIDE.md](./docs/OCR_GUIDE.md)
2. **Implémenter Pages React** - frontend/src/pages/
3. **Implémenter Routes API** - backend/src/routes/
4. **Tester Flux Complet** - End-to-end testing
5. **Déploiement** - Docker pour production

---

## 📞 Support

Pour questions ou problèmes:
1. Consulter les docs dans `/docs`
2. Vérifier les logs Docker
3. Activer debug mode en backend

---

**Last Updated**: Avril 2026
