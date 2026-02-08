# Test Scenarios for Company Membership

## Scenario 1: Regular User Leaves Company

### Step 1: Check user is active member
```http
GET /company-users/5/active-members
```

### Step 2: User leaves company
```http
POST /company-users/leave
Content-Type: application/json

{
  "userId": 3,
  "companyId": 5
}
```

**Expected Result:**
- User marked as inactive (isActive: false)
- leftAt timestamp set to current time
- User still appears in history but not in active members

### Step 3: Verify user left
```http
GET /company-users/history/3
```

Should show the membership with `isActive: false` and `leftAt` populated.

---

## Scenario 2: Admin Transfer Without Leaving

### Step 1: Check current admins
```http
GET /company-users/5/admins
```

### Step 2: Transfer admin role
```http
POST /company-users/transfer-admin
Content-Type: application/json

{
  "currentAdminUserId": 1,
  "newAdminUserId": 2,
  "companyId": 5,
  "reason": "Promoting to admin role"
}
```

**Expected Result:**
- User 1 becomes manager
- User 2 becomes admin
- AdminTransfer record created

### Step 3: Verify transfer
```http
GET /company-users/5/admin-history
```

Should show the transfer record with both users and reason.

---

## Scenario 3: Admin Leaves Company (Full Flow)

### Step 1: Verify admin status
```http
GET /company-users/5/admins
```

### Step 2: Admin attempts to leave without transfer (SHOULD FAIL)
```http
POST /company-users/leave
Content-Type: application/json

{
  "userId": 1,
  "companyId": 5
}
```

**Expected Result:** 
```json
{
  "statusCode": 400,
  "message": "Admin must transfer role before leaving. Use admin-leave endpoint instead.",
  "error": "Bad Request"
}
```

### Step 3: Admin leaves with transfer (CORRECT)
```http
POST /company-users/admin-leave
Content-Type: application/json

{
  "adminUserId": 1,
  "newAdminUserId": 2,
  "companyId": 5,
  "reason": "Leaving the organization"
}
```

**Expected Result:**
- Admin role transferred to user 2
- User 1 marked as inactive and left
- AdminTransfer record created
- Success message returned

### Step 4: Verify new admin
```http
GET /company-users/5/admins
```

Should only show user 2 as admin now.

### Step 5: Check transfer history
```http
GET /company-users/5/admin-history
```

Should show the transfer with reason "Leaving the organization".

---

## Scenario 4: User Rejoins Company

### Step 1: Verify user previously left
```http
GET /company-users/history/3
```

Should show a membership with `isActive: false` and `leftAt` timestamp.

### Step 2: User rejoins
```http
POST /company-users/rejoin
Content-Type: application/json

{
  "userId": 3,
  "companyId": 5
}
```

**Expected Result:**
- isActive set to true
- leftAt cleared (set to null)
- isRequested set to true (may need approval)
- Previous role and jobTitle preserved

### Step 3: Verify rejoined
```http
GET /company-users/5/active-members
```

User 3 should appear in active members list.

---

## Scenario 5: Multiple Admin Transfers (Chain)

### Setup: Company has User 1 as admin

### Transfer 1: User 1 → User 2
```http
POST /company-users/transfer-admin
Content-Type: application/json

{
  "currentAdminUserId": 1,
  "newAdminUserId": 2,
  "companyId": 5,
  "reason": "Vacation coverage"
}
```

### Transfer 2: User 2 → User 3
```http
POST /company-users/transfer-admin
Content-Type: application/json

{
  "currentAdminUserId": 2,
  "newAdminUserId": 3,
  "companyId": 5,
  "reason": "Permanent assignment"
}
```

### Verify complete chain
```http
GET /company-users/5/admin-history
```

Should show both transfers in chronological order:
1. User 1 → User 2 (Vacation coverage)
2. User 2 → User 3 (Permanent assignment)

---

## Scenario 6: Edge Cases & Validation

### Test 1: User rejoins without previous membership (SHOULD FAIL)
```http
POST /company-users/rejoin
Content-Type: application/json

{
  "userId": 99,
  "companyId": 5
}
```

**Expected:** Error - "No previous membership found"

---

### Test 2: User rejoins while already active (SHOULD FAIL)
```http
POST /company-users/rejoin
Content-Type: application/json

{
  "userId": 2,
  "companyId": 5
}
```

**Expected:** Error - "User is already an active member"

---

### Test 3: Transfer to self (SHOULD FAIL)
```http
POST /company-users/transfer-admin
Content-Type: application/json

{
  "currentAdminUserId": 1,
  "newAdminUserId": 1,
  "companyId": 5,
  "reason": "Test"
}
```

**Expected:** Error - "Cannot transfer admin role to yourself"

---

### Test 4: Non-admin tries admin transfer (SHOULD FAIL)
```http
POST /company-users/transfer-admin
Content-Type: application/json

{
  "currentAdminUserId": 99,
  "newAdminUserId": 2,
  "companyId": 5,
  "reason": "Test"
}
```

**Expected:** Error - "Current user is not an active admin"

---

### Test 5: Transfer to inactive user (SHOULD FAIL)
```http
POST /company-users/transfer-admin
Content-Type: application/json

{
  "currentAdminUserId": 1,
  "newAdminUserId": 99,
  "companyId": 5,
  "reason": "Test"
}
```

**Expected:** Error - "New admin must be an active member of the company"

---

## Scenario 7: View Complete History

### Get user's complete company history
```http
GET /company-users/history/1
```

**Expected Response Structure:**
```json
[
  {
    "id": 10,
    "companyId": 5,
    "role": "employee",
    "isActive": false,
    "leftAt": "2026-02-04T04:56:26.000Z",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "company": {
      "id": 5,
      "name": "Security Co",
      "companyCode": "SEC001"
    },
    "rosters": [/* recent rosters */]
  },
  {
    "id": 8,
    "companyId": 3,
    "role": "manager",
    "isActive": true,
    "leftAt": null,
    "createdAt": "2024-06-10T08:00:00.000Z",
    "company": {
      "id": 3,
      "name": "Other Company",
      "companyCode": "OTH001"
    },
    "rosters": [/* recent rosters */]
  }
]
```

Shows user worked at company 5 (left), currently at company 3 (active).

---

## Data Integrity Checks

### Check 1: Every company has at least one active admin
```sql
SELECT c.id, c.name, COUNT(cu.id) as admin_count
FROM "Company" c
LEFT JOIN "CompanyUser" cu ON cu."companyId" = c.id 
  AND cu.role = 'admin' 
  AND cu."isActive" = true
GROUP BY c.id, c.name
HAVING COUNT(cu.id) = 0;
```

Should return 0 rows (all companies should have at least one admin).

### Check 2: All admin transfers are recorded
```sql
SELECT * FROM "AdminTransfer" ORDER BY "createdAt" DESC;
```

Should show complete audit trail of all role changes.

### Check 3: No active user with leftAt timestamp
```sql
SELECT * FROM "CompanyUser" 
WHERE "isActive" = true AND "leftAt" IS NOT NULL;
```

Should return 0 rows (active users shouldn't have leftAt set).

### Check 4: All inactive users have leftAt timestamp
```sql
SELECT * FROM "CompanyUser" 
WHERE "isActive" = false AND "leftAt" IS NULL;
```

Should ideally return 0 rows (inactive users should have leftAt timestamp).

---

## Performance Considerations

For large datasets, consider indexing:

```sql
-- Index for finding user's company history
CREATE INDEX idx_companyuser_userid_isactive 
  ON "CompanyUser"("userId", "isActive");

-- Index for admin transfers by company
CREATE INDEX idx_admintransfer_companyid_createdat 
  ON "AdminTransfer"("companyId", "createdAt" DESC);

-- Index for active members query
CREATE INDEX idx_companyuser_companyid_isactive_role 
  ON "CompanyUser"("companyId", "isActive", "role");
```

These indexes are already defined in the schema via `@@index` directives.
