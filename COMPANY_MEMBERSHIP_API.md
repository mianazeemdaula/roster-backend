# Company Membership API Documentation

## Overview
This API manages company memberships with support for:
- Users joining and leaving companies
- Maintaining complete membership history
- Admin role transfers with audit trail
- Preventing admins from leaving without transferring role

---

## Endpoints

### 1. Leave Company (Regular User)
**POST** `/company-users/leave`

Regular employees or managers can leave a company. Admins must use the admin-leave endpoint.

**Request Body:**
```json
{
  "userId": 1,
  "companyId": 5
}
```

**Response:**
```json
{
  "id": 10,
  "userId": 1,
  "companyId": 5,
  "role": "employee",
  "jobTitle": "Guard",
  "isActive": false,
  "leftAt": "2026-02-04T04:56:26.000Z",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2026-02-04T04:56:26.000Z"
}
```

**Validation:**
- User must be an active member
- Admins cannot use this endpoint (will get error)

---

### 2. Transfer Admin Role
**POST** `/company-users/transfer-admin`

Transfer admin role from one user to another. Creates an audit trail record.

**Request Body:**
```json
{
  "currentAdminUserId": 1,
  "newAdminUserId": 2,
  "companyId": 5,
  "reason": "Temporary transfer for vacation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin role transferred successfully",
  "transfer": {
    "id": 1,
    "companyId": 5,
    "fromCompanyUserId": 10,
    "toCompanyUserId": 11,
    "reason": "Temporary transfer for vacation",
    "createdAt": "2026-02-04T04:56:26.000Z",
    "fromCompanyUser": {
      "id": 10,
      "userId": 1,
      "role": "manager",
      "user": { "id": 1, "name": "John Doe", "email": "john@example.com" }
    },
    "toCompanyUser": {
      "id": 11,
      "userId": 2,
      "role": "admin",
      "user": { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
    }
  }
}
```

**Validation:**
- Current user must be an active admin
- New admin must be an active member
- Cannot transfer to yourself

---

### 3. Admin Leave Company
**POST** `/company-users/admin-leave`

Admin leaves company by transferring role and then leaving in one transaction.

**Request Body:**
```json
{
  "adminUserId": 1,
  "newAdminUserId": 2,
  "companyId": 5,
  "reason": "Leaving organization"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin role transferred and user left the company successfully"
}
```

**Validation:**
- User must be an active admin
- New admin must be an active member
- Creates audit trail entry
- Sets leftAt timestamp

---

### 4. Rejoin Company
**POST** `/company-users/rejoin`

User rejoins a company they previously left. Requires previous membership record.

**Request Body:**
```json
{
  "userId": 1,
  "companyId": 5
}
```

**Response:**
```json
{
  "id": 10,
  "userId": 1,
  "companyId": 5,
  "role": "employee",
  "jobTitle": "Guard",
  "isActive": true,
  "isRequested": true,
  "leftAt": null,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2026-02-04T04:56:26.000Z",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
  "company": { "id": 5, "name": "Security Co", "companyCode": "SEC001" }
}
```

**Notes:**
- Sets `isRequested: true` - may need admin approval
- Clears `leftAt` timestamp
- Preserves previous role and job title

---

### 5. Get User Company History
**GET** `/company-users/history/:userId`

Get complete membership history for a user across all companies.

**Response:**
```json
[
  {
    "id": 10,
    "userId": 1,
    "companyId": 5,
    "role": "employee",
    "jobTitle": "Guard",
    "isActive": true,
    "leftAt": null,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "company": { "id": 5, "name": "Security Co", "companyCode": "SEC001" },
    "rosters": [/* recent 5 rosters */]
  },
  {
    "id": 8,
    "userId": 1,
    "companyId": 3,
    "role": "manager",
    "jobTitle": "Senior Guard",
    "isActive": false,
    "leftAt": "2025-12-01T10:00:00.000Z",
    "createdAt": "2024-06-10T08:00:00.000Z",
    "company": { "id": 3, "name": "Old Company", "companyCode": "OLD001" },
    "rosters": [/* recent 5 rosters */]
  }
]
```

**Notes:**
- Returns both active and inactive memberships
- Sorted by: active first, then by creation date
- Includes recent rosters for context

---

### 6. Get Admin Transfer History
**GET** `/company-users/:companyId/admin-history`

Get complete audit trail of admin role transfers for a company.

**Response:**
```json
[
  {
    "id": 2,
    "companyId": 5,
    "fromCompanyUserId": 10,
    "toCompanyUserId": 11,
    "reason": "Admin leaving company",
    "createdAt": "2026-02-04T04:56:26.000Z",
    "fromCompanyUser": {
      "id": 10,
      "userId": 1,
      "role": "employee",
      "user": { "id": 1, "name": "John Doe", "email": "john@example.com" }
    },
    "toCompanyUser": {
      "id": 11,
      "userId": 2,
      "role": "admin",
      "user": { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
    }
  },
  {
    "id": 1,
    "companyId": 5,
    "fromCompanyUserId": 9,
    "toCompanyUserId": 10,
    "reason": "Temporary transfer for vacation",
    "createdAt": "2025-08-15T12:00:00.000Z",
    "fromCompanyUser": {
      "id": 9,
      "userId": 3,
      "role": "manager",
      "user": { "id": 3, "name": "Bob Wilson", "email": "bob@example.com" }
    },
    "toCompanyUser": {
      "id": 10,
      "userId": 1,
      "role": "employee",
      "user": { "id": 1, "name": "John Doe", "email": "john@example.com" }
    }
  }
]
```

---

### 7. Get Company Admins
**GET** `/company-users/:companyId/admins`

Get all current active admins for a company.

**Response:**
```json
[
  {
    "id": 11,
    "userId": 2,
    "companyId": 5,
    "role": "admin",
    "jobTitle": "Operations Manager",
    "isActive": true,
    "user": {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890"
    }
  }
]
```

---

### 8. Get Active Company Members
**GET** `/company-users/:companyId/active-members`

Get all active members of a company (excludes users who left).

**Response:**
```json
[
  {
    "id": 11,
    "userId": 2,
    "companyId": 5,
    "role": "admin",
    "jobTitle": "Operations Manager",
    "isActive": true,
    "user": { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
  },
  {
    "id": 12,
    "userId": 4,
    "companyId": 5,
    "role": "manager",
    "jobTitle": "Site Supervisor",
    "isActive": true,
    "user": { "id": 4, "name": "Mike Johnson", "email": "mike@example.com" }
  },
  {
    "id": 13,
    "userId": 5,
    "companyId": 5,
    "role": "employee",
    "jobTitle": "Guard",
    "isActive": true,
    "user": { "id": 5, "name": "Sarah Davis", "email": "sarah@example.com" }
  }
]
```

**Notes:**
- Sorted by role (admins first) then by join date
- Only includes active members (isActive: true)

---

## Database Schema Changes

### CompanyUser Table
- Added `leftAt: DateTime?` - Timestamp when user left
- Added relations for admin transfer tracking

### AdminTransfer Table (New)
```prisma
model AdminTransfer {
  id                Int @id @default(autoincrement())
  companyId         Int
  fromCompanyUserId Int
  toCompanyUserId   Int
  reason            String?
  createdAt         DateTime @default(now())
}
```

---

## Business Rules Summary

1. **Regular users** can leave anytime using `/leave`
2. **Admins** must transfer role before leaving using `/admin-leave`
3. **History is maintained** - records are never deleted, only marked inactive
4. **Audit trail** - all admin transfers are recorded
5. **Rejoining** is possible for users with previous membership
6. **Cannot transfer to self** - prevents accidental mistakes

---

## Error Responses

### User Not Active Member
```json
{
  "statusCode": 400,
  "message": "User is not an active member of this company",
  "error": "Bad Request"
}
```

### Admin Must Transfer First
```json
{
  "statusCode": 400,
  "message": "Admin must transfer role before leaving. Use admin-leave endpoint instead.",
  "error": "Bad Request"
}
```

### Invalid Transfer Target
```json
{
  "statusCode": 400,
  "message": "New admin must be an active member of the company",
  "error": "Bad Request"
}
```

### Cannot Transfer to Self
```json
{
  "statusCode": 400,
  "message": "Cannot transfer admin role to yourself",
  "error": "Bad Request"
}
```
