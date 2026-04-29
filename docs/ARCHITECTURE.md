# 🏗️ Architecture Système

## Vue d'Ensemble

Architecture moderna basée sur microservices avec séparation nette entre frontend, backend, et services d'identité.

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (React SPA)                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │   Pages          │  │  Components      │  │   Services       │ │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤ │
│  │ - Home           │  │ - OCRRecognition │  │ - api.service    │ │
│  │ - Identification │  │ - PlateInput     │  │ - ocr.service    │ │
│  │ - SelectStation  │  │ - StationMap     │  │ - auth.service   │ │
│  │ - Reservation    │  │ - TimeSlots      │  │ - payment.svc    │ │
│  │ - Confirmation   │  │ - OTPVerify      │  │                  │ │
│  │ - Dashboard      │  │ - Notifications  │  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                     │
│  State Management: Zustand / Context API                           │
│  HTTP Client: Axios                                                │
│  UI Framework: Tailwind CSS                                        │
│  OCR: Tesseract.js (Worker Thread)                                │
│  Auth: Keycloak.js / OAuth2 / PKCE                                │
│                                                                     │
└───────────────┬───────────────────────────────────────────────────┘
                │ HTTPS + JWT Bearer Token
                │
┌───────────────▼───────────────────────────────────────────────────┐
│                    API GATEWAY / LOAD BALANCER                     │
│                         (Optional nginx)                           │
└───────────────┬───────────────────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────────────────────────┐
│                   BACKEND LAYER (Node.js/Express)                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                       Middleware Stack                       │ │
│  │  [ Logger ] → [ CORS ] → [ Auth ] → [ Validation ] → Route  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Route Handlers  │  │   Controllers    │  │   Services       │ │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤ │
│  │ GET /vehicles    │  │ VehicleController│  │ VehicleService  │ │
│  │ POST /reserve    │  │ ReservationCtrl  │  │ ReservationSvc  │ │
│  │ POST /verify-otp │  │ OTPController    │  │ OTPService      │ │
│  │ GET /stations    │  │ StationController│  │ StationService  │ │
│  │ GET /slots/:id   │  │ SlotController   │  │ SlotService     │ │
│  │ POST /auth/*     │  │ AuthController   │  │ AuthService     │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │   Data Models    │  │  External APIs   │  │ Notifications    │ │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤ │
│  │ - User           │  │ - Keycloak       │  │ - Email (SMTP)   │ │
│  │ - Vehicle        │  │ - License DB     │  │ - SMS (Twilio)   │ │
│  │ - Reservation    │  │ - Maps (OSM)     │  │ - Push notif     │ │
│  │ - Station        │  │ - Payment (API)  │  │ - WebSocket      │ │
│  │ - TimeSlot       │  │                  │  │                  │ │
│  │ - OTPVerify      │  │                  │  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                     │
│  Error Handling: Custom Error Classes                              │
│  Validation: Joi / Express-validator                               │
│  Logging: Morgan + Winston                                         │
│  Security: Helmet, Rate Limiting, CORS                            │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────┬──┘
                           │                                      │
        ┌──────────────────▼─────────────────┐    ┌────────────┬─▼─────┐
        │   DATABASE LAYER (PostgreSQL)      │    │  Auth Svc  │       │
        ├────────────────────────────────────┤    │ (Keycloak) │       │
        │                                    │    └────────────┘       │
        │  ┌──────────────────────────────┐ │         ▲                │
        │  │ Relational Data              │ │         │ JWT Verify     │
        │  │ - Users                      │ │         │                │
        │  │ - Vehicles                   │ │    ┌────┴─────────────┐  │
        │  │ - Reservations               │ │    │  External APIs   │  │
        │  │ - Stations                   │ │    ├──────────────────┤  │
        │  │ - TimeSlots                  │ │    │ - License DB     │  │
        │  │ - OTP Tokens                 │ │    │ - Map Services   │  │
        │  │ - AuditLogs                  │ │    │ - SMS Provider   │  │
        │  │ - Notifications              │ │    │ - Email Service  │  │
        │  └──────────────────────────────┘ │    │ - Payment Gate   │  │
        │                                    │    └──────────────────┘  │
        │  Indexing Strategy:                │                          │
        │  - PK: id, FK: references         │    Caching Layer:         │
        │  - Index: user_id, status        │    - Redis (optional)     │
        │  - Full-text search: stations    │    - Session store        │
        │                                    │                          │
        └────────────────────────────────────┘                          │
                                                                        │
                                          ┌─────────────────────────────┘
                                          │
        ┌─────────────────────────────────▼──────────────────┐
        │  INFRASTRUCTURE & DEPLOYMENT                       │
        ├─────────────────────────────────────────────────────┤
        │                                                     │
        │  Docker Compose Containers:                        │
        │  ┌─────────────────────────────────────────────┐  │
        │  │ Service          │ Image        │ Port      │  │
        │  ├─────────────────────────────────────────────┤  │
        │  │ postgres         │ postgres:16  │ 5432     │  │
        │  │ keycloak         │ keycloak:23  │ 8080     │  │
        │  │ backend          │ node:20      │ 5000     │  │
        │  │ frontend         │ node:20      │ 3000     │  │
        │  │ nginx (optional) │ nginx:latest │ 80/443   │  │
        │  │ redis (optional) │ redis:latest │ 6379     │  │
        │  └─────────────────────────────────────────────┘  │
        │                                                     │
        │  Volumes: data persistence, configs                │
        │  Networks: custom bridge network                   │
        │           for secure inter-service communication   │
        │                                                     │
        │  Environment Variables: .env files                │
        │  Secrets: External secret management (vault)      │
        │                                                     │
        └─────────────────────────────────────────────────────┘
```

## Flux de Données - Cas d'Usage Principal

### UC-1: Identification Véhicule & Réservation

```
USER                 FRONTEND                 BACKEND              EXTERNAL SERVICES
 │                      │                        │                        │
 │─ 1. Open App ─────────→ React App Loads        │                        │
 │                      │                        │                        │
 │─ 2. OCR Photo ──────→ Tesseract.js (Client)    │                        │
 │                      │ (No server call)        │                        │
 │                      │                        │                        │
 │                      │ 3. Sends Plate ─────→  POST /vehicles/identify   │
 │                      │                   │─ 4. Verify License ────→ License DB
 │                      │                        │ 5. Return Brand ←──────│
 │                      │ ← 6. Vehicle Data ─────│                        │
 │                      │ (Tesla/BYD/VW theme)   │                        │
 │                      │                        │                        │
 │─ 7. Select Station ──→ GET /stations           │                        │
 │                      │─ 8. Query Stations ───→ DB Query                 │
 │                      │ ← 9. Stations List ────│                        │
 │                      │                        │                        │
 │─ 10. Select TimeSlot →  POST /reserve          │                        │
 │                      │─ 11. Redirect to ─────→ Keycloak Login ──────→   │
 │                      │    Keycloak            │                        │
 │                      │ ← 12. OAuth2 Code ─────│            ← ─────────│
 │                      │                 │14. Exchange Code           │
 │                      │                 │─→ Get JWT Token ←──────────│
 │                      │ ← 15. Token ────│                            │
 │                      │                 │                            │
 │ 16. Input Contacts → │ POST /verify-contacts   │                        │
 │ (Email/Phone)       │─ 17. Validate & Store ─→ DB                      │
 │                      │                        │                        │
 │ 18. Select OTP ──→  │ POST /otp/send          │                        │
 │     Method           │─ 19. Generate OTP ────→ DB                       │
 │                      │─ 20. Send OTP ─────────→ SMTP/SMS Gateway ──────→
 │                      │                        │                        │
 │ 21. Enter OTP ──→   │ POST /otp/verify        │                        │
 │                      │─ 22. Verify OTP ──────→ DB Check                │
 │                      │ ← 23. Verified ────────│                        │
 │                      │                        │                        │
 │ 24. Confirm ─────→ │ POST /reservations/confirm                        │
 │                      │─ 25. Create Reservation→ DB                      │
 │                      │─ 26. Send Confirmation─→ Email/SMS ────────────→│
 │                      │ ← 27. Confirmation ────│                        │
 │                      │                        │                        │
 │ 28. View Dashboard   │ GET /reservations      │                        │
 │                      │─ 29. Fetch User Res. ─→ DB                      │
 │                      │ ← 30. Reservations ────│                        │
 │                      │                        │                        │
```

## Sécurité - Layers

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Transport Security                             │
│ - HTTPS/TLS Required                                    │
│ - SSL Certificates (Let's Encrypt)                      │
│ - HSTS Headers                                          │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────▼─────────────────────────────┐
│ Layer 2: Authentication (Keycloak OAuth2)                 │
│ - JWT Bearer Tokens                                       │
│ - PKCE Flow (Public Clients)                             │
│ - Refresh Tokens                                         │
│ - Token Expiration: 5 min (access), 30 days (refresh)    │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────▼─────────────────────────────┐
│ Layer 3: Authorization (RBAC)                             │
│ - User Roles (user, admin, moderator)                    │
│ - Fine-grained Permissions                              │
│ - Scope-based access                                     │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────▼─────────────────────────────┐
│ Layer 4: Validation & Sanitization                        │
│ - Input Validation (Joi, Express-validator)              │
│ - SQL Injection Prevention (Parameterized Queries)        │
│ - XSS Prevention (Helmet, Content-Security-Policy)       │
│ - CSRF Protection                                        │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────▼─────────────────────────────┐
│ Layer 5: Rate Limiting & DDoS                            │
│ - Rate Limiter Middleware (requests/minute)              │
│ - CORS Configuration                                     │
│ - IP Whitelisting (optional)                            │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────▼─────────────────────────────┐
│ Layer 6: Data Layer Security                             │
│ - Encrypted passwords (bcrypt)                           │
│ - Sensitive data encryption at rest                      │
│ - Database access controls                              │
│ - Audit logging                                         │
└─────────────────────────────────────────────────────────┘
```

## Patterns & Best Practices

### 1. Error Handling

```javascript
// Custom Error Classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

// Global Error Middleware
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});
```

### 2. Service Layer Pattern

```javascript
// Service encapsulates business logic
class ReservationService {
  async createReservation(userId, vehicleId, stationId, slotId) {
    // Validate inputs
    // Check availability
    // Create record
    // Notify user
    // Return result
  }
}

// Controller orchestrates
app.post('/reservations', async (req, res, next) => {
  try {
    const result = await reservationService.createReservation(...);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
```

### 3. Repository Pattern

```javascript
class VehicleRepository {
  async findById(id) { }
  async findByPlate(plate) { }
  async create(data) { }
  async update(id, data) { }
  async delete(id) { }
}
```

### 4. Dependency Injection

```javascript
const container = {
  vehicleService: new VehicleService(vehicleRepository),
  reservationService: new ReservationService(reservationRepository, OTPService),
  authService: new AuthService(userRepository, keycloakClient)
};

// Use in routes
app.post('/reservations', async (req, res) => {
  const result = await container.reservationService.create(req.body);
  res.json(result);
});
```

## Scalabilité

Pour supporter milliers d'utilisateurs:

1. **Database Optimization**
   - Partitioning tables par date
   - Indexes sur foreign keys
   - Query optimization avec EXPLAIN

2. **Caching**
   - Redis pour stations (TTL: 5 min)
   - User sessions
   - Token blacklist

3. **Load Balancing**
   - Multiple backend instances
   - Sticky sessions pour WebSocket
   - Health checks

4. **Monitoring**
   - Logs centralisés (ELK stack)
   - Performance metrics (Prometheus)
   - Error tracking (Sentry)

