# Swagger Documentation Setup Guide

## Installation

The Swagger/OpenAPI documentation has been integrated into your Attendance Management System API. Follow these steps to set it up:

### 1. Install Dependencies

```bash
npm install swagger-jsdoc swagger-ui-express
```

This will add:
- `swagger-jsdoc`: Generates OpenAPI/Swagger specs from JSDoc comments
- `swagger-ui-express`: Serves interactive Swagger UI

### 2. Project Structure

```
backend/
├── server.js                 # Main server file (updated)
├── swagger.js               # Swagger configuration
├── API_DOCUMENTATION.md     # Comprehensive API docs
├── src/
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints (updated)
│   │   ├── classRoutes.js       # Class endpoints (updated)
│   │   └── attendanceRoutes.js  # Attendance endpoints (updated)
│   └── ...
└── package.json             # Updated with Swagger dependencies
```

## Accessing Swagger Documentation

### 1. Start the Server

```bash
npm run dev
# or
npm start
```

### 2. Open in Browser

Navigate to one of these URLs:

- **Swagger UI (Interactive):** http://localhost:5000/api/v1/docs
- **OpenAPI JSON Spec:** http://localhost:5000/api/v1/swagger.json
- **API Health Check:** http://localhost:5000/

### 3. Expected Output

When the server starts, you'll see:
```
Server running in development mode on port 5000
📚 API Documentation available at: http://localhost:5000/api/v1/docs
```

## Features

### ✅ Complete Documentation Coverage

- **Authentication Endpoints**
  - Register
  - Login
  - Logout
  - Refresh Token
  - Forgot Password
  - Reset Password

- **Class Management Endpoints**
  - Create Class (Teacher only)
  - Join Class (Student only)
  - Get Classes
  - Delete Class (Teacher only)

- **Attendance Tracking Endpoints**
  - Start Session (Teacher only)
  - End Session (Teacher only)
  - Mark Attendance
  - Manual Override (Teacher only)
  - Get Reports (Teacher only)

### 📋 Documentation Includes

- Request/Response schemas with examples
- Authentication requirements (Bearer Token)
- Error responses with status codes
- Rate limiting information
- Role-based access control details
- Query parameters and path parameters
- Request body specifications

### 🔒 Security Documentation

- JWT Bearer Token authentication
- Cookie-based session support
- Rate limiting details
- CORS configuration
- Password requirements
- Input validation and sanitization

## Testing the API

### Using Swagger UI

1. Open http://localhost:5000/api/v1/docs
2. Click "Authorize" button to add JWT token
3. Paste your token: `your_jwt_token_here`
4. Click on any endpoint to expand it
5. Fill in required parameters
6. Click "Try it out" button
7. Click "Execute" to make the request

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "Student"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Get Classes (with token)
curl -X GET http://localhost:5000/api/v1/classes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import the OpenAPI JSON from: http://localhost:5000/api/v1/swagger.json
2. Collections will be auto-generated
3. Set up authorization with your JWT token
4. Test endpoints directly

## Customization

### Modify Swagger Configuration

Edit `swagger.js` to customize:

```javascript
info: {
  title: 'Your API Title',
  version: '2.0.0',
  description: 'Your description',
  // ... other details
}
```

### Update Swagger Endpoint Path

In `server.js`, change the documentation path:

```javascript
// Current: /api/v1/docs
// To customize: change the path in both places
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.get('/api/swagger.json', (req, res) => { ... });
```

### Add or Modify Endpoints

JSDoc comments are already added to all route files. To add new endpoints:

```javascript
/**
 * @swagger
 * /api/v1/endpoint:
 *   get:
 *     summary: Endpoint description
 *     tags:
 *       - Category
 *     responses:
 *       200:
 *         description: Success response
 */
router.get('/endpoint', handler);
```

## Troubleshooting

### Swagger UI not loading

1. Verify `swagger.js` exists in the root directory
2. Check that `swagger-ui-express` is installed: `npm list swagger-ui-express`
3. Ensure the route in `server.js` is correct

### Documentation missing for endpoints

1. Verify JSDoc comments are above route definitions
2. Check that route files are listed in swagger.js: `apis: ['./src/routes/*.js']`
3. Restart the server after adding new documentation

### Tokens not working in Swagger UI

1. Click "Authorize" button
2. Paste your JWT token (without "Bearer " prefix if the field requires it)
3. Click "Authorize" then "Close"
4. The token will be automatically added to requests

### Port already in use

If port 5000 is in use, set a different port:

```bash
PORT=5001 npm start
```

Then access docs at: http://localhost:5001/api/v1/docs

## Files Overview

- **swagger.js**: Swagger configuration with OpenAPI 3.0 spec definition
- **server.js**: Updated with Swagger UI middleware
- **API_DOCUMENTATION.md**: Comprehensive markdown documentation
- **Route files**: Updated with JSDoc comments for auto-documentation

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start server: `npm run dev`
3. ✅ Open documentation: http://localhost:5000/api/v1/docs
4. ✅ Test endpoints using Swagger UI
5. ✅ Share documentation URL with team

## Support

For more information:
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger UI Documentation](https://github.com/swagger-api/swagger-ui)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)

---

**Documentation Generated:** May 25, 2024
