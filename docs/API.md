# 📚 API Documentation

## Base URL
```
Development: http://localhost:5000
Production: https://api.bornes-recharge.com
```

## Authentication
All protected endpoints require JWT Bearer token:
```
Authorization: Bearer <access_token>
```

---

## 🚗 Vehicles Endpoints

### POST /api/vehicles/identify
Identify vehicle from license plate.

**Request:**
```json
{
  "plate": "AB-123-CD",
  "country": "FR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "brand": "Tesla",
    "model": "Model 3",
    "year": 2023,
    "color": "Blue",
    "confidence": 0.95
  }
}
```

**Status:** 200

---

### POST /api/vehicles
Register vehicle for user.

**Request:**
```json
{
  "brand": "Tesla",
  "model": "Model 3",
  "licensePlate": "AB-123-CD",
  "licensePlateCountry": "FR",
  "yearOfManufacture": 2023,
  "color": "Blue"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "userId": 1,
    "brand": "Tesla",
    ...
  }
}
```

**Status:** 201

---

## 🏢 Stations Endpoints

### GET /api/stations
Get all stations with available slots.

**Query Params:**
- `brand`: Filter by vehicle brand (optional)
- `latitude`: User latitude (optional)
- `longitude`: User longitude (optional)
- `radius`: Search radius in km (default: 50)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Charging Hub Downtown",
      "address": "123 Main St",
      "brand": "Tesla",
      "availableSlots": 5,
      "totalSlots": 10,
      "distance": 2.5,
      "latitude": 48.8566,
      "longitude": 2.3522
    }
  ]
}
```

**Status:** 200

---

### GET /api/stations/:id
Get station details.

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Station Name",
    "address": "...",
    "description": "...",
    "amenities": ["WiFi", "Bathroom"],
    "availableSlots": 5,
    "totalSlots": 10,
    "operatingHours": {
      "monday": "08:00-22:00",
      "sunday": "09:00-21:00"
    }
  }
}
```

---

### GET /api/stations/:id/availability
Get availability for next 7 days.

**Response:**
```json
{
  "data": {
    "2024-05-01": {
      "slots": [
        { "time": "09:00-10:00", "available": 3 },
        { "time": "10:00-11:00", "available": 1 },
        { "time": "11:00-12:00", "available": 0 }
      ]
    }
  }
}
```

---

## ⏰ Time Slots Endpoints

### GET /api/slots?stationId=1&date=2024-05-01
Get available time slots for station and date.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "stationId": 1,
      "date": "2024-05-01",
      "startTime": "09:00",
      "endTime": "10:00",
      "availableSpots": 2,
      "capacity": 3
    }
  ]
}
```

---

## 📅 Reservations Endpoints

### POST /api/reservations
Create new reservation.

**Auth:** Required ✅

**Request:**
```json
{
  "vehicleId": 1,
  "stationId": 1,
  "timeSlotId": 5,
  "estimatedDurationMinutes": 60
}
```

**Response:**
```json
{
  "data": {
    "id": 123,
    "reservationCode": "RES-2024-001",
    "status": "pending",
    "createdAt": "2024-05-01T10:00:00Z",
    "expiresAt": "2024-05-01T11:00:00Z"
  }
}
```

**Status:** 201

---

### GET /api/reservations
Get user reservations.

**Auth:** Required ✅

**Query Params:**
- `status`: Filter (pending, confirmed, expired, cancelled)
- `limit`: 10 (default)
- `offset`: 0 (default)

**Response:**
```json
{
  "data": [
    {
      "id": 123,
      "reservationCode": "RES-2024-001",
      "vehicle": { "brand": "Tesla", "licensePlate": "AB-123-CD" },
      "station": { "name": "Downtown Hub", "address": "..." },
      "date": "2024-05-01",
      "startTime": "10:00",
      "endTime": "11:00",
      "status": "confirmed"
    }
  ],
  "pagination": { "total": 45, "limit": 10, "offset": 0 }
}
```

---

### GET /api/reservations/:id
Get reservation details.

**Auth:** Required ✅

---

### PATCH /api/reservations/:id
Update reservation.

**Auth:** Required ✅

**Request:**
```json
{
  "status": "cancelled",
  "reason": "Cannot make it"
}
```

**Status:** 200

---

## 🔐 OTP Verification Endpoints

### POST /api/otp/send
Send OTP for reservation confirmation.

**Auth:** Required ✅

**Request:**
```json
{
  "reservationId": 123,
  "method": "email",
  "contact": "user@example.com"
}
```

**Response:**
```json
{
  "data": {
    "verificationId": "otp-123",
    "method": "email",
    "masked": "user***@example.com",
    "expiresIn": 600
  }
}
```

**Status:** 200

---

### POST /api/otp/verify
Verify OTP code.

**Auth:** Required ✅

**Request:**
```json
{
  "verificationId": "otp-123",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reservationId": 123,
    "verified_at": "2024-05-01T10:05:00Z"
  }
}
```

**Status:** 200

---

### POST /api/otp/resend
Resend OTP code.

**Auth:** Required ✅

**Request:**
```json
{
  "verificationId": "otp-123"
}
```

**Status:** 200

---

## 👤 User Endpoints

### GET /api/users/profile
Get user profile.

**Auth:** Required ✅

**Response:**
```json
{
  "data": {
    "id": 1,
    "keycloakId": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phones": ["+33612345678"],
    "emails": ["user@example.com", "alt@example.com"],
    "vehicles": [{ "id": 1, "brand": "Tesla", ... }],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### PATCH /api/users/profile
Update user profile.

**Auth:** Required ✅

**Request:**
```json
{
  "firstName": "Jane",
  "phones": ["+33612345678", "+33687654321"],
  "emails": ["newmail@example.com"]
}
```

**Status:** 200

---

### POST /api/users/contact-verify
Add and verify contact (email or phone).

**Auth:** Required ✅

**Request:**
```json
{
  "type": "email",
  "contact": "newemail@example.com"
}
```

**Response:**
```json
{
  "data": {
    "verificationId": "contact-ver-123",
    "method": "email",
    "expiresIn": 600
  }
}
```

---

### POST /api/users/contact-verify/confirm
Confirm contact verification.

**Auth:** Required ✅

**Request:**
```json
{
  "verificationId": "contact-ver-123",
  "code": "123456"
}
```

**Status:** 200

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": {
    "email": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 🔄 Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK - Successful GET/PATCH |
| 201  | Created - Successful POST |
| 204  | No Content - Successful DELETE |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Missing/invalid token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 409  | Conflict - Duplicate or conflict |
| 429  | Rate Limited |
| 500  | Server Error |

---

## 📊 Pagination

Endpoints returning lists support pagination:

**Query Params:**
```
?limit=20&offset=0
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "pages": 8
  }
}
```

---

## 🔄 Webhooks (Optional Future)

Subscribe to events:
- `reservation.created`
- `reservation.confirmed`
- `reservation.cancelled`
- `vehicle.registered`

