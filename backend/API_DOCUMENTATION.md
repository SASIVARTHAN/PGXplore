# PGXplore API Documentation

Base URL: `http://localhost:8080`

All responses use the standard wrapper:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { },
  "timestamp": "2026-06-10T12:00:00"
}
```

Errors return RFC 7807 `ProblemDetail` with `title`, `status`, `detail`, and `timestamp`.

Authentication: `Authorization: Bearer <accessToken>`

---

## Auth Module

### Register
- **Purpose:** Create a new USER or PG_OWNER account
- **Method + URL:** `POST /api/auth/register`
- **Auth:** None
- **Request Body:**
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | name | string | Yes | Full name (max 100) |
  | email | string | Yes | Valid email |
  | password | string | Yes | Min 8 characters |
  | phone | string | Yes | 10-digit phone |
  | role | enum | Yes | `USER` or `PG_OWNER` |
- **Response:** `AuthResponse` with accessToken, refreshToken, userId, role
- **Success:** 201
- **Errors:** 400 (validation), 409 (duplicate email)
- **cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password@123","phone":"9876543210","role":"USER"}'
```

### Login
- **Purpose:** Authenticate and receive JWT tokens
- **Method + URL:** `POST /api/auth/login`
- **Auth:** None
- **Request:** `{ "email": "admin@pgxplore.com", "password": "Password@123" }`
- **Success:** 200
- **Errors:** 401 (invalid credentials)
- **cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pgxplore.com","password":"Password@123"}'
```

### Refresh Token
- **Purpose:** Obtain new access token using refresh token
- **Method + URL:** `POST /api/auth/refresh-token`
- **Auth:** None
- **Request:** `{ "refreshToken": "<token>" }`
- **Success:** 200 | **Errors:** 401

### Forgot Password
- **Purpose:** Send password reset email
- **Method + URL:** `POST /api/auth/forgot-password`
- **Request:** `{ "email": "user@example.com" }`
- **Success:** 200

### Reset Password
- **Purpose:** Set new password with reset token
- **Method + URL:** `POST /api/auth/reset-password`
- **Request:** `{ "token": "<uuid>", "newPassword": "NewPass@123" }`
- **Success:** 200 | **Errors:** 400 (expired/invalid token)

### Google Login
- **Purpose:** Authenticate users using Google OAuth (Google Identity Services ID token)
- **Method + URL:** `POST /api/auth/google`
- **Auth:** None
- **Request Body:**
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | idToken | string | Yes | JWT ID token from Google Sign-In on the frontend |
- **Backend flow:**
  1. Verify Google ID token (audience = `GOOGLE_CLIENT_ID`)
  2. Extract Google ID, email, name, profile picture
  3. Find or auto-register user in MySQL
  4. Sync user profile to Firestore collection `users`
  5. Issue JWT access token (24h expiry) + refresh token
- **Response (`GoogleLoginResponse`):**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "accessToken": "jwt-token",
    "refreshToken": "uuid",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "email": "user@gmail.com",
    "role": "USER",
    "name": "User Name",
    "profilePicture": "https://lh3.googleusercontent.com/...",
    "userId": 1
  }
}
```
- **JWT claims:** `sub` (email), `userId`, `role`
- **Success:** 200
- **Error codes:** 400 (invalid token), 401 (unauthorized), 500 (server error)
- **cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"google-id-token-here"}'
```

### Google Config
- **URL:** `GET /api/auth/google/config` | **Auth:** None
- **Response:** `{ clientId, devMode, enabled }`

### Google Dev Login (local development only)
- **URL:** `POST /api/auth/google/dev` | **Auth:** None
- **Enabled when:** `pgxplore.google.dev-mode=true` (dev profile)
- **Purpose:** Test Google login flow without Google Cloud credentials

### Email/Password Login Response
Login and register responses now include a `token` field (alias for `accessToken`):
```json
{
  "token": "jwt-token",
  "accessToken": "jwt-token",
  "role": "USER"
}
```

---

## User Module

### Get Profile
- **URL:** `GET /api/users/profile` | **Auth:** JWT | **Success:** 200

### Update Profile
- **URL:** `PUT /api/users/profile` | **Auth:** JWT
- **Request:** `{ "name": "Updated Name", "phone": "9876543210" }`

### Delete Account
- **URL:** `DELETE /api/users/account` | **Auth:** JWT | **Success:** 200

### List Favorites
- **URL:** `GET /api/users/favorites` | **Auth:** JWT

### Add Favorite
- **URL:** `POST /api/users/favorites/{pgId}` | **Auth:** JWT | **Success:** 201

### Remove Favorite
- **URL:** `DELETE /api/users/favorites/{pgId}` | **Auth:** JWT

**cURL (profile):**
```bash
curl http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## PG Listing Module

### Create PG
- **URL:** `POST /api/pg` | **Auth:** PG_OWNER, ADMIN
- **Request:**
```json
{
  "name": "Green Nest PG",
  "description": "Spacious boys PG",
  "address": "12 Station Road",
  "city": "Chennai",
  "area": "Tambaram",
  "latitude": 12.9249,
  "longitude": 80.1000,
  "rent": 6500,
  "deposit": 5000,
  "gender": "BOYS",
  "amenities": ["WiFi","AC","Parking"],
  "availableBeds": 4,
  "availableRooms": 2,
  "foodAvailable": true,
  "contactNumber": "9876543210"
}
```
- **Success:** 201 | **Errors:** 400, 403

### Update PG
- **URL:** `PUT /api/pg/{id}` | **Auth:** Owner or ADMIN

### Delete PG
- **URL:** `DELETE /api/pg/{id}` | **Auth:** Owner or ADMIN

### Get PG by ID
- **URL:** `GET /api/pg/{id}` | **Auth:** Public

### List All PGs (paginated)
- **URL:** `GET /api/pg/all?page=0&size=10&sortBy=rent&sortDir=asc` | **Auth:** Public

---

## Search & Filter Module

### Search PGs
- **URL:** `GET /api/pg/search`
- **Auth:** Public
- **Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| city | string | Filter by city |
| area | string | Filter by area |
| minRent | decimal | Minimum rent |
| maxRent | decimal | Maximum rent |
| gender | enum | BOYS, GIRLS, CO_LIVING |
| foodAvailable | boolean | Food filter |
| wifi | boolean | WiFi amenity |
| ac | boolean | AC amenity |
| parking | boolean | Parking amenity |
| laundry | boolean | Laundry amenity |
| minRating | decimal | Minimum rating |
| availableBeds | int | Min available beds |
| availableRooms | int | Min available rooms |
| keyword | string | Full-text search |
| page | int | Page number (default 0) |
| size | int | Page size (default 10) |
| sortBy | string | Sort field |
| sortDir | string | asc or desc |

- **cURL:**
```bash
curl "http://localhost:8080/api/pg/search?city=Chennai&maxRent=7000&wifi=true&page=0&size=10"
```

---

## Reviews Module

### Create Review
- **URL:** `POST /api/reviews` | **Auth:** USER
- **Request:** `{ "pgId": 1, "rating": 5, "reviewText": "Great PG!" }`

### Update Review
- **URL:** `PUT /api/reviews/{id}` | **Auth:** Owner only

### Delete Review
- **URL:** `DELETE /api/reviews/{id}` | **Auth:** Owner or ADMIN

### List Reviews for PG
- **URL:** `GET /api/reviews/pg/{pgId}?page=0&size=10` | **Auth:** Public

---

## Image Upload Module

### Upload Image
- **URL:** `POST /api/images/upload` | **Auth:** PG_OWNER, ADMIN
- **Content-Type:** `multipart/form-data`
- **Fields:** `file` (image), `pgId` (long), `primary` (boolean)
- **Validation:** jpg/jpeg/png/webp only, max 5MB, max 10 images per PG

### Delete Image
- **URL:** `DELETE /api/images/{id}` | **Auth:** Owner or ADMIN

---

## Recently Viewed Module

### Track View
- **URL:** `POST /api/recently-viewed/{pgId}` | **Auth:** JWT
- Keeps latest 10 PGs per user

### List Recently Viewed
- **URL:** `GET /api/recently-viewed` | **Auth:** JWT

---

## Inquiry Module

### Submit Inquiry
- **URL:** `POST /api/inquiries` | **Auth:** USER
- **Request:** `{ "pgId": 1, "message": "Is a room available?", "contactNumber": "9876543210" }`

### My Inquiries
- **URL:** `GET /api/inquiries/my` | **Auth:** USER

### Owner Inquiries
- **URL:** `GET /api/inquiries/owner` | **Auth:** PG_OWNER

---

## Admin Module

All require **ADMIN** role.

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/pgs` | List all PGs |
| DELETE | `/api/admin/user/{id}` | Delete user |
| DELETE | `/api/admin/pg/{id}` | Delete PG |
| PUT | `/api/admin/verify-owner/{id}` | Verify PG owner |

---

## AI Natural Language Search

### Natural Search
- **URL:** `POST /api/search/natural` | **Auth:** JWT
- **Request:** `{ "query": "Boys PG under 7000 in Chennai with WiFi" }`
- **Response:** Paginated PG results (same as `/api/pg/search`)
- Uses OpenAI to extract filters, falls back to keyword search if API unavailable

**cURL:**
```bash
curl -X POST http://localhost:8080/api/search/natural \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"Boys PG under 7000 in Chennai with WiFi"}'
```

---

## Postman Setup

1. Import `PGXplore.postman_collection.json`
2. Set environment variables:
   - `baseUrl` = `http://localhost:8080`
   - `accessToken` = (set after login via Tests script)
3. Run **Auth > Login** first to populate token

## Error Codes Summary

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized / expired JWT |
| 403 | Access denied |
| 404 | Resource not found |
| 409 | Duplicate resource |
| 500 | Internal server error |
