# 📚 Swagger API Documentation

Your Attendance Management System API now has comprehensive Swagger/OpenAPI documentation!

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm run dev
```

### 3. View Documentation
Open your browser and go to:
```
http://localhost:5000/api/v1/docs
```

## 📖 Documentation Files

- **`API_DOCUMENTATION.md`** - Complete API reference with examples
- **`SWAGGER_SETUP.md`** - Setup and customization guide
- **`swagger.js`** - OpenAPI specification configuration
- **Interactive Swagger UI** - Available at `/api/v1/docs` when server is running

## 🎯 What's Included

✅ **19 API Endpoints** fully documented:
- 6 Authentication endpoints
- 4 Class management endpoints
- 5 Attendance tracking endpoints
- 4 Report generation endpoints

✅ **Complete Request/Response Examples**
- Request body schemas
- Response format for all status codes
- Error handling documentation
- Parameter descriptions

✅ **Authentication & Security**
- JWT Bearer token support
- Role-based access control (RBAC)
- Rate limiting details
- Password requirements

✅ **Interactive Testing**
- Try endpoints directly in Swagger UI
- Test with real JWT tokens
- View live responses
- Check error scenarios

## 🚀 Features

### For Developers
- Copy-paste ready API examples
- Clear endpoint descriptions
- Parameter validation rules
- Response schema definitions

### For API Consumers
- Beautiful interactive documentation
- Executable requests in browser
- Authorization token management
- Real-time API exploration

### For Teams
- Shareable documentation URL
- OpenAPI JSON export
- Postman collection import
- Easy to keep updated

## 📝 Endpoints at a Glance

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login with credentials
- `POST /auth/logout` - Logout session
- `POST /auth/refresh-token` - Get new JWT
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset with token

### Classes
- `POST /classes` - Create class (Teacher)
- `GET /classes` - List user's classes
- `POST /classes/:classId/join` - Join class (Student)
- `DELETE /classes/:id` - Delete class (Teacher)

### Attendance
- `POST /attendance/start` - Start session (Teacher)
- `PUT /attendance/end/:sessionId` - End session (Teacher)
- `POST /attendance/mark` - Mark attendance (Student)
- `POST /attendance/override` - Override record (Teacher)
- `GET /attendance/reports/:classId` - Get reports (Teacher)

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Or in Swagger UI:
1. Click "Authorize" button
2. Enter your JWT token
3. Click "Authorize"

## 📊 Rate Limiting

API is rate-limited to prevent abuse:
- **General API**: 100 requests per 15 minutes
- **Login**: 5 attempts per 15 minutes
- **Token Refresh**: 10 attempts per 15 minutes

## 🛠️ Customization

To modify Swagger documentation:

1. **Edit swagger.js** - Update OpenAPI spec
2. **Update JSDoc comments** - In route files
3. **Restart server** - Changes apply automatically

Example JSDoc comment:
```javascript
/**
 * @swagger
 * /api/v1/endpoint:
 *   post:
 *     summary: What this endpoint does
 *     tags:
 *       - Category
 */
```

## 🧪 Testing with cURL

```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}' \
  | jq -r '.token')

# Use token to access protected endpoint
curl -X GET http://localhost:5000/api/v1/classes \
  -H "Authorization: Bearer $TOKEN"
```

## 📱 Export Options

### OpenAPI JSON
```
GET http://localhost:5000/api/v1/swagger.json
```

### Import to Postman
1. Open Postman
2. File → Import
3. Enter: `http://localhost:5000/api/v1/swagger.json`
4. Collections auto-generated

## 🐛 Troubleshooting

**Swagger UI not loading?**
- Verify `npm install` was run
- Check port 5000 is not in use
- Look for errors in server logs

**Tokens not working?**
- Ensure JWT token is valid and not expired
- Check Authorization header format
- Try refreshing token if expired

**Documentation out of date?**
- Restart server after updating JSDoc
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)

## 📚 Additional Resources

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger UI Docs](https://github.com/swagger-api/swagger-ui)
- [swagger-jsdoc Guide](https://github.com/Surnet/swagger-jsdoc)
- [JWT Authentication](https://jwt.io)

## 🔗 Links

- **Interactive Docs**: http://localhost:5000/api/v1/docs
- **OpenAPI JSON**: http://localhost:5000/api/v1/swagger.json
- **Health Check**: http://localhost:5000/

## 💡 Next Steps

1. ✅ Read `API_DOCUMENTATION.md` for detailed endpoint info
2. ✅ Open Swagger UI and try endpoints
3. ✅ Use `SWAGGER_SETUP.md` to customize docs
4. ✅ Share documentation URL with team
5. ✅ Keep JSDoc comments updated as API evolves

---

**Happy documenting! 🚀**

For questions or improvements, refer to the documentation files or the server logs.
