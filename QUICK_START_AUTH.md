# Quick Start - Testing Authentication

## 1. Start the Server

```bash
npm run start:dev
```

## 2. Test Registration

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    ...
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 3. Test Login with Email

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 4. Test Login with Phone

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "password": "password123"
  }'
```

## 5. Test Protected Route (Get Profile)

```bash
# Replace YOUR_TOKEN with the actual token from login/register
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 6. Test Protected Route (Get Users)

```bash
# The users endpoint is now protected
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Using Postman

### Register/Login:
1. Method: POST
2. URL: `http://localhost:3000/auth/register` or `http://localhost:3000/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Routes:
1. Method: GET
2. URL: `http://localhost:3000/auth/profile`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <paste_your_token_here>`

## Common Issues

### 1. "Invalid credentials"
- Check that email/phone and password are correct
- Ensure user exists (for login)

### 2. "User already exists"
- Use a different email or phone number
- Or use login instead of register

### 3. "Invalid or expired token"
- Get a new token by logging in again
- Check that you're including "Bearer " before the token

### 4. "Email or phone is required"
- Provide either email or phone in login request

## Environment Setup

Make sure you have a `.env` file with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/roster_db"
JWT_SECRET="your-secret-key"
PORT=3000
```

## Database Migration

If you haven't already, run:

```bash
npx prisma migrate dev --name add_auth_fields
npx prisma generate
```

## Testing Flow

1. **Register** a new user → Save the `access_token`
2. **Login** with credentials → Verify you get a token
3. **Access protected route** → Use the token in Authorization header
4. **Verify token expiration** → Token expires after 30 days (default)

## Next Steps

- Protect other controllers with `@UseGuards(JwtAuthGuard)`
- Use `@CurrentUser()` decorator to get user in routes
- Customize JWT expiration in `auth.module.ts`
- Add refresh token functionality
- Implement password reset
- Add email/phone verification
