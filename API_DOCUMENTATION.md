# Attendance Management System API Documentation

## Overview
A comprehensive REST API for managing student attendance with support for authentication, class management, and attendance tracking. The API uses JWT tokens for authentication and MongoDB for data persistence.

**API Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api/v1`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Class Management](#class-management)
3. [Attendance Tracking](#attendance-tracking)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Security](#security)

---

## Authentication

### 1. Register User
Create a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "Student"
}
```

**Parameters:**
- `name` (string, required): User's full name
- `email` (string, required): Valid email address
- `password` (string, required): Minimum 6 characters, must include uppercase, lowercase, and number
- `role` (string, required): Either "Teacher" or "Student"

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Student",
    "isEmailVerified": false,
    "createdAt": "2024-05-25T12:04:41.256Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

### 2. Login
Authenticate user and receive JWT token.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Parameters:**
- `email` (string, required): Registered email address
- `password` (string, required): User's password

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Student",
    "isEmailVerified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Rate Limit:** 5 attempts per 15 minutes per IP

---

### 3. Logout
Invalidate user session.

**Endpoint:** `POST /api/v1/auth/logout`

**Authentication:** Required (Bearer Token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 4. Refresh Token
Get a new JWT token using a refresh token.

**Endpoint:** `POST /api/v1/auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token_here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Rate Limit:** 10 attempts per 15 minutes per IP

---

### 5. Forgot Password
Request password reset email.

**Endpoint:** `POST /api/v1/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reset email sent to your email address"
}
```

**Rate Limit:** 5 attempts per 15 minutes per IP

---

### 6. Reset Password
Reset password using token from email.

**Endpoint:** `POST /api/v1/auth/reset-password/:token`

**Parameters:**
- `token` (string, required): Reset token from email

**Request Body:**
```json
{
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Class Management

All class endpoints require authentication (Bearer Token).

### 1. Create Class
Create a new class (Teacher only).

**Endpoint:** `POST /api/v1/classes`

**Authentication:** Required (Teacher role)

**Request Body:**
```json
{
  "name": "Computer Science 101",
  "description": "Introduction to Computer Science"
}
```

**Parameters:**
- `name` (string, required): Class name
- `description` (string, optional): Class description

**Success Response (201):**
```json
{
  "success": true,
  "message": "Class created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "Computer Science 101",
    "code": "ABC123XYZ",
    "teacher": "60d5ec49c1234567890abcdf",
    "students": [],
    "createdAt": "2024-05-25T12:04:41.256Z"
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Only teachers can create classes"
}
```

---

### 2. Join Class
Join an existing class (Student only).

**Endpoint:** `POST /api/v1/classes/:classId/join`

**Authentication:** Required (Student role)

**Parameters:**
- `classId` (string, path, required): ID of the class to join

**Request Body:**
```json
{
  "classCode": "ABC123XYZ"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully joined the class",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "Computer Science 101",
    "code": "ABC123XYZ",
    "teacher": "60d5ec49c1234567890abcdf",
    "students": ["60d5ec49c1234567890abce0", "60d5ec49c1234567890abce1"],
    "createdAt": "2024-05-25T12:04:41.256Z"
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Only students can join classes"
}
```

---

### 3. Get Classes
Retrieve all classes for the authenticated user.

**Endpoint:** `GET /api/v1/classes`

**Authentication:** Required (Teacher or Student role)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Classes retrieved successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abcde",
      "name": "Computer Science 101",
      "code": "ABC123XYZ",
      "teacher": "60d5ec49c1234567890abcdf",
      "students": ["60d5ec49c1234567890abce0"],
      "createdAt": "2024-05-25T12:04:41.256Z"
    }
  ]
}
```

---

### 4. Delete Class
Delete a class (Teacher only).

**Endpoint:** `DELETE /api/v1/classes/:id`

**Authentication:** Required (Teacher role)

**Parameters:**
- `id` (string, path, required): ID of the class to delete

**Success Response (200):**
```json
{
  "success": true,
  "message": "Class deleted successfully"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Only teachers can delete classes"
}
```

---

## Attendance Tracking

All attendance endpoints require authentication (Bearer Token).

### 1. Start Attendance Session
Start a new attendance session (Teacher only).

**Endpoint:** `POST /api/v1/attendance/start`

**Authentication:** Required (Teacher role)

**Request Body:**
```json
{
  "classId": "60d5ec49c1234567890abcde"
}
```

**Parameters:**
- `classId` (string, required): ID of the class for this session

**Success Response (201):**
```json
{
  "success": true,
  "message": "Session started successfully",
  "data": {
    "_id": "60d5ec49c1234567890abce2",
    "classId": "60d5ec49c1234567890abcde",
    "startTime": "2024-05-25T12:04:41.256Z",
    "endTime": null,
    "status": "active",
    "attendance": []
  }
}
```

---

### 2. End Attendance Session
Close an active attendance session (Teacher only).

**Endpoint:** `PUT /api/v1/attendance/end/:sessionId`

**Authentication:** Required (Teacher role)

**Parameters:**
- `sessionId` (string, path, required): ID of the session to end

**Success Response (200):**
```json
{
  "success": true,
  "message": "Session ended successfully",
  "data": {
    "_id": "60d5ec49c1234567890abce2",
    "classId": "60d5ec49c1234567890abcde",
    "startTime": "2024-05-25T12:04:41.256Z",
    "endTime": "2024-05-25T13:04:41.256Z",
    "status": "closed",
    "attendance": [
      {
        "studentId": "60d5ec49c1234567890abce0",
        "status": "present"
      }
    ]
  }
}
```

---

### 3. Mark Attendance
Mark attendance for a student (Student or Teacher).

**Endpoint:** `POST /api/v1/attendance/mark`

**Authentication:** Required (Student or Teacher role)

**Request Body:**
```json
{
  "sessionId": "60d5ec49c1234567890abce2",
  "status": "present"
}
```

**Parameters:**
- `sessionId` (string, required): ID of the active session
- `status` (string, required): One of "present", "absent", "late"

**Success Response (200):**
```json
{
  "success": true,
  "message": "Attendance marked successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Session is not active"
}
```

---

### 4. Manual Override
Override attendance record manually (Teacher only).

**Endpoint:** `POST /api/v1/attendance/override`

**Authentication:** Required (Teacher role)

**Request Body:**
```json
{
  "sessionId": "60d5ec49c1234567890abce2",
  "studentId": "60d5ec49c1234567890abce0",
  "status": "present",
  "reason": "Medical leave"
}
```

**Parameters:**
- `sessionId` (string, required): ID of the attendance session
- `studentId` (string, required): ID of the student
- `status` (string, required): One of "present", "absent", "late"
- `reason` (string, optional): Reason for override

**Success Response (200):**
```json
{
  "success": true,
  "message": "Attendance updated successfully"
}
```

---

### 5. Get Attendance Reports
Generate attendance reports for a class (Teacher only).

**Endpoint:** `GET /api/v1/attendance/reports/:classId`

**Authentication:** Required (Teacher role)

**Parameters:**
- `classId` (string, path, required): ID of the class

**Query Parameters:**
- `startDate` (string, optional): Start date (YYYY-MM-DD format)
- `endDate` (string, optional): End date (YYYY-MM-DD format)

**Example:** `/api/v1/attendance/reports/60d5ec49c1234567890abcde?startDate=2024-05-01&endDate=2024-05-31`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reports generated successfully",
  "data": {
    "classId": "60d5ec49c1234567890abcde",
    "className": "Computer Science 101",
    "totalSessions": 10,
    "reportPeriod": {
      "startDate": "2024-05-01",
      "endDate": "2024-05-31"
    },
    "students": [
      {
        "studentId": "60d5ec49c1234567890abce0",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "presentDays": 8,
        "absentDays": 1,
        "lateDays": 1,
        "attendancePercentage": 80
      }
    ]
  }
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

### Common Error Codes

| Status Code | Message | Cause |
|---|---|---|
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User lacks required permissions (role-based) |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

| Endpoint | Limit | Window |
|---|---|---|
| Login | 5 attempts | 15 minutes |
| Register | 5 attempts | 15 minutes |
| Forgot Password | 5 attempts | 15 minutes |
| Refresh Token | 10 attempts | 15 minutes |
| General API | 100 requests | 15 minutes |

**Rate Limit Headers:**
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Unix timestamp when limit resets

---

## Security

### Authentication Methods
- **Bearer Token (JWT)**: Include in Authorization header
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Cookie**: Session cookie included automatically

### Protected Resources
- All class endpoints require authentication
- All attendance endpoints require authentication
- Teacher endpoints require Teacher role
- Student endpoints require Student role

### Security Headers
- Helmet.js: Secure HTTP headers
- CORS: Cross-origin resource sharing configured
- Mongo Sanitization: Input validation and sanitization
- HPP: HTTP Parameter Pollution protection

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## Example API Calls

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "Student"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Create Class (with authentication):**
```bash
curl -X POST http://localhost:5000/api/v1/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Computer Science 101",
    "description": "Introduction to CS"
  }'
```

### Using JavaScript/Fetch

```javascript
// Login
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
const token = data.token;

// Create Class with authentication
const classResponse = await fetch('http://localhost:5000/api/v1/classes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Computer Science 101',
    description: 'Introduction to CS'
  })
});
```

---

## Data Models

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: String (enum: ['Teacher', 'Student'], required),
  isEmailVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Class Schema
```javascript
{
  name: String (required),
  description: String,
  code: String (unique, auto-generated),
  teacher: ObjectId (reference to User),
  students: [ObjectId] (references to User),
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Session Schema
```javascript
{
  classId: ObjectId (reference to Class),
  startTime: Date,
  endTime: Date,
  status: String (enum: ['active', 'closed']),
  attendance: [{
    studentId: ObjectId,
    status: String (enum: ['present', 'absent', 'late']),
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Support & Contact
For API support, please contact: support@example.com

---

**Last Updated:** May 25, 2024  
**Version:** 1.0.0
