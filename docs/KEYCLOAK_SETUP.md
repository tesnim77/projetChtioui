# 🔐 Configuration Keycloak avec Docker

Guide complet pour configurer Keycloak 23+ comme serveur d'identité centralisé.

## 📋 Architecture

```
┌─────────────────────┐
│   React Frontend    │
│   (Port 3000)       │
└────────┬────────────┘
         │
    ┌────▼──────────┐
    │ Keycloak.js   │  
    │ (Login flow)  │
    └────┬──────────┘
         │
    ┌────▼──────────────────────┐
    │ Keycloak Server           │
    │ (Port 8080)               │
    │ - OAuth2/OIDC             │
    │ - JWT Tokens              │
    │ - User Management         │
    └────┬──────────────────────┘
         │
    ┌────▼──────────┐
    │ PostgreSQL    │
    │ (Keycloak DB) │
    └───────────────┘
```

## 🚀 Démarrage Rapide

### 1. Lancer Keycloak

```bash
cd docker
docker-compose up -d keycloak postgres
```

Accès:
- **URL**: http://localhost:8080
- **Admin Console**: http://localhost:8080/admin
- **Username**: admin
- **Password**: admin_password

### 2. Vérifier la santé

```bash
curl http://localhost:8080/health/live
```

## 🔧 Configuration Manuelle du Realm

Si vous voulez configurer manuellement (au lieu du JSON):

### Étape 1: Créer le Realm

1. Connexion à Admin Console
2. Cliquer "Create realm"
3. **Name**: `bornes-recharge`
4. **Enabled**: ✅ OUI
5. Sauvegarder

### Étape 2: Créer le Client

1. Menu **Clients**
2. **Create Client**
   - **Client ID**: `bornes-app`
   - **Client Type**: `OpenID Connect`
   - **Proceed**

3. Configuration Général:
   - **Enabled**: ✅ OUI
   - **Client authentication**: ✅ ON (confidential)
   - **Authentication flow**: ✅ Standard flow, Direct access grants

4. **Redirect URIs**:
   ```
   http://localhost:3000/*
   http://localhost:3000/callback
   ```

5. **Web Origins**:
   ```
   http://localhost:3000
   ```

6. **Sauvegarder**

### Étape 3: Générer Secret Client

1. Aller dans **Credentials**
2. Vue le **Client Secret**
3. Copier et sauvegarder dans `.env` du backend

### Étape 4: Créer un Utilisateur Test

1. Menu **Users**
2. **Add User**
   - **Username**: `testuser`
   - **Email**: `test@bornes.local`
   - **Email verified**: ✅ OUI
   - **Enabled**: ✅ OUI

3. **Set Password** (Credentials tab):
   - **Password**: `Test@123456`
   - **Temporary**: ❌ NON

## 🔄 Flux OAuth2

```
┌─────────────────┐
│   User           │
│   (Frontend)     │
└────────┬─────────┘
         │
         │ 1. Click Login
         │
    ┌────▼──────────────────────┐
    │ Redirects to:             │
    │ /auth/realms/{realm}/     │
    │ protocol/openid-connect/auth │
    │ ?client_id=bornes-app     │
    │ &redirect_uri=...         │
    │ &response_type=code       │
    └────┬──────────────────────┘
         │
    ┌────▼─────────────────────┐
    │ 2. Login Screen           │
    │ (Keycloak)                │
    │ - Email/Password form     │
    │ - MFA optional            │
    └────┬──────────────────────┘
         │
    ┌────▼─────────────────────────┐
    │ 3. Authorization Code      │
    │ Returned to redirect_uri   │
    │ with ?code=xxxxx          │
    └────┬───────────────────────┘
         │
    ┌────▼────────────────────────────┐
    │ 4. Backend exchanges code       │
    │ POST /protocol/openid-connect/  │
    │      token                      │
    │ - client_id                     │
    │ - client_secret                 │
    │ - code                          │
    │ - grant_type=authorization_code │
    └────┬───────────────────────────┘
         │
    ┌────▼──────────────────┐
    │ 5. Returns:           │
    │ - access_token (JWT)  │
    │ - refresh_token       │
    │ - id_token            │
    │ - expires_in          │
    └───────────────────────┘
```

## 💾 Variables d'Environnement

**Backend** (`.env`):
```env
# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=bornes-recharge
KEYCLOAK_CLIENT_ID=bornes-app
KEYCLOAK_CLIENT_SECRET=your_secret_here
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin_password

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION=2592000
```

**Frontend** (`.env`):
```env
REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=bornes-recharge
REACT_APP_KEYCLOAK_CLIENT_ID=bornes-app
REACT_APP_API_URL=http://localhost:5000
```

## 📚 Code Frontend: Keycloak Integration

### Installation

```bash
npm install keycloak-js
```

### Service Keycloak (`frontend/src/services/keycloak.service.js`)

```javascript
import Keycloak from 'keycloak-js';

let keycloakInstance = null;

export async function initKeycloak() {
  if (keycloakInstance) return keycloakInstance;

  const keycloak = new Keycloak({
    url: import.meta.env.REACT_APP_KEYCLOAK_URL,
    realm: import.meta.env.REACT_APP_KEYCLOAK_REALM,
    clientId: import.meta.env.REACT_APP_KEYCLOAK_CLIENT_ID
  });

  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      pkceMethod: 'S256'
    });

    keycloakInstance = keycloak;
    return keycloak;
  } catch (error) {
    console.error('Keycloak initialization failed', error);
    throw error;
  }
}

export function login() {
  if (keycloakInstance) {
    keycloakInstance.login();
  }
}

export function logout() {
  if (keycloakInstance) {
    keycloakInstance.logout({ redirectUri: window.location.origin });
  }
}

export function getToken() {
  return keycloakInstance?.token;
}

export function isAuthenticated() {
  return keycloakInstance?.authenticated ?? false;
}

export function getUserInfo() {
  return keycloakInstance?.userInfo;
}

export function getKeycloak() {
  return keycloakInstance;
}
```

### Hook React (`frontend/src/hooks/useAuth.js`)

```javascript
import { useEffect, useState } from 'react';
import { initKeycloak, isAuthenticated, getToken, getUserInfo, login, logout } from '../services/keycloak.service';

export function useAuth() {
  const [state, setState] = useState({
    isInitialized: false,
    isAuthenticated: false,
    user: null,
    token: null,
    error: null
  });

  useEffect(() => {
    (async () => {
      try {
        const keycloak = await initKeycloak();
        setState({
          isInitialized: true,
          isAuthenticated: keycloak.authenticated,
          user: keycloak.authenticated ? keycloak.userInfo : null,
          token: keycloak.authenticated ? keycloak.token : null,
          error: null
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isInitialized: true,
          error: error.message
        }));
      }
    })();
  }, []);

  return {
    ...state,
    login,
    logout
  };
}
```

### Protection Route (`frontend/src/components/ProtectedRoute.jsx`)

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }) {
  const { isInitialized, isAuthenticated } = useAuth();

  if (!isInitialized) {
    return <div className="text-center p-8">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

## 📤 Backend: Vérification JWT

### Middleware Keycloak (`backend/src/middleware/keycloak-auth.js`)

```javascript
import axios from 'axios';
import jwt from 'jsonwebtoken';

const keycloakUrl = process.env.KEYCLOAK_URL;
const realm = process.env.KEYCLOAK_REALM;
const publicKeyUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`;

let publicKey = null;

// Cache public key
async function getPublicKey() {
  if (publicKey) return publicKey;

  try {
    const response = await axios.get(publicKeyUrl);
    const keys = response.data.keys;
    if (keys && keys.length > 0) {
      publicKey = keys[0];
      return publicKey;
    }
  } catch (error) {
    console.error('Failed to fetch Keycloak public key', error);
  }
}

export async function keycloakAuthMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const publicKeyData = await getPublicKey();
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\\n${publicKeyData.x5c[0]}\\n-----END PUBLIC KEY-----`;

    const decoded = jwt.verify(token, publicKeyPem, {
      algorithms: ['RS256'],
      issuer: `${keycloakUrl}/realms/${realm}`
    });

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      username: decoded.preferred_username,
      roles: decoded.realm_access?.roles || []
    };

    next();
  } catch (error) {
    console.error('Token verification failed', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Utilisation dans Routes

```javascript
import express from 'express';
import { keycloakAuthMiddleware } from './middleware/keycloak-auth.js';

const app = express();

// Route publique
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Route protégée
app.get('/api/reservations', keycloakAuthMiddleware, async (req, res) => {
  const userId = req.user.id;
  // Récupérer les réservations de l'utilisateur
  res.json({ ... });
});
```

## 🆔 Multi-Tenancy (Optionnel)

Pour supporter plusieurs organisations:

```json
{
  "realms": [
    {
      "realm": "bornes-recharge-tesla",
      "clients": [{"clientId": "tesla-app"}]
    },
    {
      "realm": "bornes-recharge-byd",
      "clients": [{"clientId": "byd-app"}]
    }
  ]
}
```

## 🧪 Test du Login

```bash
# 1. Obtenir le code authorization
curl "http://localhost:8080/realms/bornes-recharge/protocol/openid-connect/auth?client_id=bornes-app&response_type=code&redirect_uri=http://localhost:3000"

# 2. Échanger code pour token
curl -X POST http://localhost:8080/realms/bornes-recharge/protocol/openid-connect/token \\
  -d grant_type=password \\
  -d client_id=bornes-app \\
  -d client_secret=...SECRET... \\
  -d username=testuser \\
  -d password=Test@123456

# 3. Utiliser le token
curl -H "Authorization: Bearer ACCESS_TOKEN" \\
  http://localhost:5000/api/reservations
```

## 📱 Social Login (Optionnel)

Ajouter des fournisseurs externes:

```bash
# Google
# Keycloak Admin > Providers > Create > Google

# GitHub
# Keycloak Admin > Providers > Create > GitHub

# Microsoft
# Keycloak Admin > Providers > Create > Microsoft
```

## 🔍 Debugging

### Logs Keycloak
```bash
docker logs bornes_keycloak -f
```

### Vérifier le Token JWT
```bash
# Copiez le token et allez sur https://jwt.io
{
  "exp": 1234567890,
  "iat": 1234567890,
  "email": "test@bornes.local",
  "preferred_username": "testuser",
  "sub": "user-id-uuid"
}
```

## ⚠️ Production Checklist

- [ ] HTTPS activé en production
- [ ] Client Secret changé
- [ ] Admin password changé
- [ ] Database backup configurée
- [ ] Logs agrégés
- [ ] CORS restrictions
- [ ] Rate limiting
- [ ] MFA activé pour admin
- [ ] SSL certificate certs

