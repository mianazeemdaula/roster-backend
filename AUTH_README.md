# Authentication System

This project implements a complete JWT-based authentication system with password hashing using bcrypt.

## Features

- **User Registration** - Create new accounts with email/phone and password
- **User Login** - Authenticate with email or phone and password
- **JWT Tokens** - Secure stateless authentication
- **Password Hashing** - bcrypt for secure password storage
- **Protected Routes** - JWT guard for route protection
- **User Profile** - Get current authenticated user details

## API Endpoints

### 1. Register
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "email": "john@example.com",
  "password": "securePassword123",
  "fcmToken": "optional_fcm_token"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "2026-02-02T10:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login
**POST** `/auth/login`

Login with email or phone and password.

**Request Body (Email):**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Request Body (Phone):**
```json
{
  "phone": "1234567890",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    "isActive": true,
    "lastLoginAt": "2026-02-02T10:30:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Profile
**GET** `/auth/profile` 🔒

Get the current authenticated user's profile. Requires JWT token.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "phone": "1234567890",
  "email": "john@example.com",
  "isActive": true,
  "createdAt": "2026-02-02T10:00:00.000Z"
}
```

### 4. Get Current User
**GET** `/auth/me` 🔒

Alternative endpoint to get current user. Requires JWT token.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:** Same as profile endpoint

## Usage in Other Modules

### Protecting Routes

To protect a route with JWT authentication:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('protected')
export class SomeController {
    @UseGuards(JwtAuthGuard)
    @Get()
    async getProtectedData() {
        return { message: 'This is protected data' };
    }
}
```

### Getting Current User in Controllers

Use the `@CurrentUser()` decorator:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('example')
export class ExampleController {
    @UseGuards(JwtAuthGuard)
    @Get('my-data')
    async getMyData(@CurrentUser() user: any) {
        // user.userId - user ID
        // user.email - user email
        // user.phone - user phone
        // user.name - user name
        return { userId: user.userId, name: user.name };
    }
}
```

### Using Request Object

Alternatively, access user via request:

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('example')
export class ExampleController {
    @UseGuards(JwtAuthGuard)
    @Get('my-data')
    async getMyData(@Request() req) {
        const userId = req.user.userId;
        return { userId };
    }
}
```

## Environment Variables

Create a `.env` file in the root directory (use `.env.example` as template):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/roster_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
NODE_ENV=development
```

⚠️ **Important:** Change `JWT_SECRET` in production to a strong, random string!

## Security Features

1. **Password Hashing** - Passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Expiration** - Tokens expire after 30 days (configurable)
3. **Active User Check** - Inactive users cannot login
4. **Last Login Tracking** - System tracks when users last logged in
5. **Soft Delete** - Users are marked as deleted, not removed from database

## Error Handling

The authentication system returns appropriate HTTP status codes:

- `200 OK` - Successful login/registration
- `400 Bad Request` - Invalid input (email or phone required)
- `401 Unauthorized` - Invalid credentials, inactive account, or invalid token
- `409 Conflict` - User already exists (registration)

## Testing

Run unit tests:

```bash
npm test
```

Run tests for auth module:

```bash
npm test -- auth
```

## Architecture

```
src/auth/
├── auth.module.ts           # Auth module configuration
├── auth.service.ts          # Business logic (login, register, JWT)
├── auth.controller.ts       # HTTP endpoints
├── auth.service.spec.ts     # Service tests
├── auth.controller.spec.ts  # Controller tests
├── dto/
│   ├── login.dto.ts         # Login validation
│   └── register.dto.ts      # Registration validation
├── guards/
│   └── jwt-auth.guard.ts    # JWT route protection
├── strategies/
│   └── jwt.strategy.ts      # Passport JWT strategy
└── decorators/
    └── current-user.decorator.ts  # Get current user decorator
```

## JWT Payload Structure

```typescript
{
  sub: number;      // User ID
  email: string;    // User email
  phone: string;    // User phone
  name: string;     // User name
  iat: number;      // Issued at
  exp: number;      // Expiration
}
```

## Future Enhancements

- [ ] Refresh tokens
- [ ] Email verification
- [ ] Phone OTP verification
- [ ] Password reset
- [ ] Two-factor authentication (2FA)
- [ ] Session management
- [ ] Rate limiting
- [ ] Account lockout after failed attempts
