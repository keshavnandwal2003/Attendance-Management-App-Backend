# 🚀 API Quick Reference Card

## 📍 URLs

| Purpose | URL |
|---------|-----|
| 📚 Swagger UI | `http://localhost:5000/api/v1/docs` |
| 📄 OpenAPI JSON | `http://localhost:5000/api/v1/swagger.json` |
| 🏥 Health Check | `http://localhost:5000/` |
| 🔗 API Base | `http://localhost:5000/api/v1` |

## 🔑 Authentication

```bash
# Get Token (Login)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Use Token
curl -X GET http://localhost:5000/api/v1/classes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Refresh Token
curl -X POST http://localhost:5000/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"REFRESH_TOKEN"}'
```

## 📋 Endpoints Overview

### Authentication (6)
```
POST   /auth/register              - Register
POST   /auth/login                 - Login
POST   /auth/logout                - Logout
POST   /auth/refresh-token         - Refresh JWT
POST   /auth/forgot-password       - Reset Request
POST   /auth/reset-password/:token - Reset Password
```

### Classes (4)
```
POST   /classes                    - Create (Teacher)
GET    /classes                    - List (Both)
POST   /classes/:classId/join      - Join (Student)
DELETE /classes/:id                - Delete (Teacher)
```

### Attendance (5)
```
POST   /attendance/start           - Start (Teacher)
PUT    /attendance/end/:sessionId  - End (Teacher)
POST   /attendance/mark            - Mark (Student/Teacher)
POST   /attendance/override        - Override (Teacher)
GET    /attendance/reports/:id     - Reports (Teacher)
```

## 📊 Roles

| Role | Can Do |
|------|--------|
| **Teacher** | Create classes, start sessions, mark attendance, override, view reports |
| **Student** | Join classes, mark attendance, view own classes |
| **Both** | Login, logout, refresh token |

## 🔐 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success ✅ |
| 201 | Created ✅ |
| 400 | Bad Request ❌ |
| 401 | Unauthorized ❌ |
| 403 | Forbidden ❌ |
| 404 | Not Found ❌ |
| 429 | Rate Limited ⏱️ |
| 500 | Server Error ⚠️ |

## 📝 Request/Response Pattern

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## ⏱️ Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5/IP | 15 min |
| Register | 5/IP | 15 min |
| General | 100/IP | 15 min |

## 🧪 Test User Flow

### 1. Register Teacher
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Smith",
    "email": "smith@example.com",
    "password": "TeacherPass123!",
    "role": "Teacher"
  }'
```

### 2. Register Student
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "StudentPass123!",
    "role": "Student"
  }'
```

### 3. Teacher Login & Create Class
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"smith@example.com","password":"TeacherPass123!"}' \
  | jq -r '.token')

# Create Class
curl -X POST http://localhost:5000/api/v1/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Physics 101",
    "description": "Introduction to Physics"
  }'
```

### 4. Student Login & Join Class
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"StudentPass123!"}' \
  | jq -r '.token')

# Join Class (use CLASS_ID from previous response)
curl -X POST http://localhost:5000/api/v1/classes/CLASS_ID/join \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"classCode":"ABC123XYZ"}'
```

### 5. Teacher Start Attendance
```bash
# Start Session
curl -X POST http://localhost:5000/api/v1/attendance/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"classId":"CLASS_ID"}'
```

### 6. Student Mark Attendance
```bash
# Mark Attendance (use SESSION_ID from previous response)
curl -X POST http://localhost:5000/api/v1/attendance/mark \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId":"SESSION_ID",
    "status":"present"
  }'
```

### 7. Teacher View Reports
```bash
curl -X GET http://localhost:5000/api/v1/attendance/reports/CLASS_ID \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test
```

## 📚 Documentation Files

- **README_SWAGGER.md** - Quick overview (start here!)
- **API_DOCUMENTATION.md** - Complete reference
- **SWAGGER_SETUP.md** - Setup & customization
- **API_ARCHITECTURE.md** - System diagrams
- **QUICK_REFERENCE.md** - This file!

## 🔗 External Resources

- [OpenAPI Spec](https://spec.openapis.org/oas/v3.0.3)
- [Swagger UI](https://github.com/swagger-api/swagger-ui)
- [JWT Info](https://jwt.io)

## ⚙️ Environment Variables

```env
MONGO_URI=mongodb://...
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## 💡 Pro Tips

1. **Use Swagger UI** for testing - No cURL needed!
2. **Save Tokens** in Postman - Makes testing easier
3. **Check Rate Limits** in response headers
4. **Use Refresh Token** when JWT expires
5. **Different Passwords** for test accounts
6. **Read Errors Carefully** - They're descriptive

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Swagger UI not loading | Check `npm install` ran successfully |
| Auth endpoints 401 | Verify credentials are correct |
| Protected endpoints 403 | Check user role matches requirement |
| Port 5000 in use | Set `PORT=5001 npm start` |
| Token expired | Use refresh-token endpoint |

---

**Last Updated:** May 25, 2024 | **Version:** 1.0.0
