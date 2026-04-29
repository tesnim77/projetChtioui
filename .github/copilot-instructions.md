<!-- Use this file to provide workspace-specific custom instructions to Copilot. -->

# 🔌 Bornes de Recharge - Project Instructions

## Project Overview
Plateforme web multi-marques pour réserver des bornes de recharge de voitures électriques (Tesla, BYD, Volkswagen).

**Architecture**: 
- Frontend: React 18 + Tailwind + Tesseract.js (OCR)
- Backend: Node.js/Express + PostgreSQL
- Auth: Keycloak (Docker)
- Deployment: Docker Compose

## Key Technologies
- **OCR**: Tesseract.js (client-side, licence plate recognition)
- **Vehicle Brands**: Tesla, BYD, Volkswagen (with brand-specific theming)
- **Auth**: OAuth2/OIDC via Keycloak
- **OTP**: Email/SMS verification
- **DB**: PostgreSQL 16
- **API**: RESTful (JWT Bearer tokens)

## Project Structure
```
bornes-recharge/
├── frontend/              # React SPA (port 3000)
├── backend/               # Node.js API (port 5000)
├── docker/                # Docker Compose (Keycloak, PostgreSQL)
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md    # System architecture
│   ├── OCR_GUIDE.md       # OCR implementation guide
│   ├── KEYCLOAK_SETUP.md  # Keycloak configuration
│   └── API.md             # API endpoints documentation
├── README.md              # Main documentation
└── QUICKSTART.md          # Quick start guide

## Frontend Structure
```
frontend/src/
├── pages/                 # Route pages
│   ├── HomePage.jsx
│   ├── IdentificationPage.jsx
│   ├── SelectStationPage.jsx
│   ├── ReservationPage.jsx
│   ├── ConfirmationPage.jsx
│   └── DashboardPage.jsx
├── components/            # React components
│   ├── ProtectedRoute.jsx
│   ├── OCRPlateRecognition.jsx
│   ├── CarBrandDetection.jsx
│   └── ...
├── services/              # API/business logic
│   ├── api.service.js
│   ├── ocr.service.js
│   └── auth.service.js
├── hooks/                 # Custom React hooks
│   └── useAuth.js
└── App.jsx                # Main app component
```

## Backend Structure
```
backend/src/
├── routes/                # Express router definitions
├── controllers/           # Request handlers
├── services/              # Business logic
├── models/                # Sequelize ORM models
├── middleware/            # Auth, validation, logging
└── server.js              # Entry point
```

## User Flow (Main Journey)
1. **Identification** - OCR recognizes license plate (Tesseract.js)
2. **Brand Detection** - App detects vehicle brand
3. **Theme Applied** - UI adapts to brand colors/logo
4. **Select Station** - User picks charging station
5. **Select Time Slot** - User picks available time
6. **Keycloak Login** - Redirect to OAuth2 login
7. **Enter Contacts** - User adds email(s) and phone(s)
8. **OTP Verification** - User selects channel and verifies
9. **Confirm Reservation** - Final confirmation
10. **Dashboard** - View/manage reservations

## Development Guidelines

### Code Style
- Frontend: ES6+, React functional components with hooks
- Backend: ES6+ modules, async/await
- Naming: camelCase for variables/functions, PascalCase for components/classes
- CSS: Tailwind utility classes (no custom CSS unless necessary)

### Database
- Migrations: SQL files in `docker/postgres/`
- Models: Use Sequelize ORM
- Indexing: Foreign keys, status fields, dates

### API Design
- RESTful endpoints with meaningful paths
- JWT Bearer token authentication
- Consistent error response format
- Pagination support for list endpoints

### Security
- HTTPS/TLS in production
- CORS restricted to frontend origin
- Input validation (Joi)
- SQL injection prevention (parameterized queries)
- Rate limiting on endpoints

### Environment Variables
- Backend: Copy `.env.example` to `.env`
- Frontend: Copy `.env.example` to `.env`
- Never commit actual `.env` files

## Getting Started

See [QUICKSTART.md](./QUICKSTART.md) for step-by-step instructions.

**Quick Commands:**
```bash
# Start infrastructure (Docker)
cd docker && docker-compose up -d

# Start backend
cd backend && npm install && npm run dev

# Start frontend
cd frontend && npm install && npm run dev
```

## Documentation References

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design & flows
- [OCR_GUIDE.md](./docs/OCR_GUIDE.md) - Tesseract.js implementation
- [KEYCLOAK_SETUP.md](./docs/KEYCLOAK_SETUP.md) - Auth configuration
- [API.md](./docs/API.md) - Complete API reference

## Important Notes

- **OCR is critical**: Invest in good image preprocessing for accuracy
- **Brand Themes**: Tesla (red), BYD (red), VW (blue)
- **International Support**: Handle license plates from multiple countries
- **Keycloak**: Multi-tenancy support for future expansion
- **Performance**: Use Tesseract worker pools to avoid UI blocking

## Next Priority Tasks

1. ✅ Project scaffold & infrastructure
2. 🔨 Implement OCR component
3. 🔨 Create React pages & routing
4. 🔨 Build API endpoints
5. 🔨 Database schema validation
6. 🔨 End-to-end testing

## Troubleshooting

**Keycloak not starting?** 
- Wait 30 seconds, check logs: `docker logs bornes_keycloak`
- Ensure PostgreSQL is healthy first

**OCR not recognizing plates?**
- Check image quality, lighting, angle
- Verify Tesseract.js is loaded properly
- See OCR_GUIDE.md for debugging

**CORS errors?**
- Verify `CLIENT_URL` in backend `.env` matches frontend URL
- Check CORS middleware in `server.js`

## Contact & Support

Review documentation first. Logs available via:
```bash
docker logs <container-name> -f
```

---

**Last Updated**: Avril 2026  
**Status**: 🚀 In Development
