# Company Membership Rules

## Business Rules

### 1. User Membership History
- Users can join and leave companies multiple times
- The system maintains a complete history of all memberships
- When a user leaves, we set `leftAt` timestamp and `isActive = false`
- Historical records are never deleted (soft delete approach)

### 2. Admin Role Requirements
- Every company must have at least one active admin
- An admin cannot leave a company without transferring admin rights
- Admin transfers are tracked in the `AdminTransfer` table
- The company owner (`Company.ownerId`) can be different from active admins

### 3. Data Structure

#### CompanyUser Changes
- `leftAt`: DateTime? - Timestamp when user left the company
- `isActive`: Boolean - Current membership status
- Relations to track admin transfers

#### AdminTransfer Table (New)
- Tracks all admin role transfers
- Records: who transferred from/to, when, and why
- Provides audit trail for admin changes

## Implementation Examples

### Leaving a Company (Regular User)
```typescript
async leaveCompany(userId: number, companyId: number) {
  const companyUser = await this.prisma.companyUser.findUnique({
    where: { userId_companyId: { userId, companyId } }
  });

  if (!companyUser || !companyUser.isActive) {
    throw new BadRequestException('User is not an active member');
  }

  if (companyUser.role === CompanyRole.admin) {
    throw new BadRequestException('Admin must transfer role before leaving');
  }

  return this.prisma.companyUser.update({
    where: { id: companyUser.id },
    data: {
      isActive: false,
      leftAt: new Date()
    }
  });
}
```

### Transferring Admin Role
```typescript
async transferAdminRole(
  currentAdminUserId: number,
  newAdminUserId: number,
  companyId: number,
  reason?: string
) {
  return await this.prisma.$transaction(async (tx) => {
    // Verify current admin
    const currentAdmin = await tx.companyUser.findFirst({
      where: {
        userId: currentAdminUserId,
        companyId,
        role: CompanyRole.admin,
        isActive: true
      }
    });

    if (!currentAdmin) {
      throw new BadRequestException('Current user is not an active admin');
    }

    // Verify new admin exists and is active
    const newAdmin = await tx.companyUser.findFirst({
      where: {
        userId: newAdminUserId,
        companyId,
        isActive: true
      }
    });

    if (!newAdmin) {
      throw new BadRequestException('New admin must be an active company member');
    }

    // Update roles
    await tx.companyUser.update({
      where: { id: currentAdmin.id },
      data: { role: CompanyRole.manager } // or employee
    });

    await tx.companyUser.update({
      where: { id: newAdmin.id },
      data: { role: CompanyRole.admin }
    });

    // Record the transfer
    await tx.adminTransfer.create({
      data: {
        companyId,
        fromCompanyUserId: currentAdmin.id,
        toCompanyUserId: newAdmin.id,
        reason
      }
    });

    return { success: true, newAdminId: newAdmin.id };
  });
}
```

### Admin Leaving Company (with Transfer)
```typescript
async adminLeaveCompany(
  adminUserId: number,
  newAdminUserId: number,
  companyId: number,
  reason?: string
) {
  return await this.prisma.$transaction(async (tx) => {
    // First transfer admin role
    await this.transferAdminRole(adminUserId, newAdminUserId, companyId, reason);

    // Now the user can leave (they're no longer admin)
    const companyUser = await tx.companyUser.findFirst({
      where: { userId: adminUserId, companyId }
    });

    await tx.companyUser.update({
      where: { id: companyUser.id },
      data: {
        isActive: false,
        leftAt: new Date()
      }
    });

    return { success: true };
  });
}
```

### Rejoining a Company
```typescript
async rejoinCompany(userId: number, companyId: number) {
  const existingMembership = await this.prisma.companyUser.findUnique({
    where: { userId_companyId: { userId, companyId } }
  });

  if (!existingMembership) {
    throw new BadRequestException('No previous membership found');
  }

  if (existingMembership.isActive) {
    throw new BadRequestException('User is already an active member');
  }

  return this.prisma.companyUser.update({
    where: { id: existingMembership.id },
    data: {
      isActive: true,
      leftAt: null, // Clear the leftAt timestamp
      isRequested: true // May need approval to rejoin
    }
  });
}
```

### Getting User's Company History
```typescript
async getUserCompanyHistory(userId: number) {
  return this.prisma.companyUser.findMany({
    where: { userId },
    include: {
      company: true
    },
    orderBy: [
      { isActive: 'desc' }, // Active memberships first
      { createdAt: 'desc' }
    ]
  });
}
```

### Getting Admin Transfer History
```typescript
async getAdminTransferHistory(companyId: number) {
  return this.prisma.adminTransfer.findMany({
    where: { companyId },
    include: {
      fromCompanyUser: {
        include: { user: true }
      },
      toCompanyUser: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

## API Endpoints to Implement

### CompanyUsers Controller
- `POST /company-users/leave` - Regular user leaves company
- `POST /company-users/transfer-admin` - Transfer admin role
- `POST /company-users/admin-leave` - Admin leaves (with transfer)
- `POST /company-users/rejoin` - User rejoins a company
- `GET /company-users/history/:userId` - Get user's company history
- `GET /company-users/:companyId/admin-history` - Get admin transfer history

## Validation Rules

1. **Before user leaves:**
   - User must be an active member
   - If admin, must have another active member to transfer to

2. **Before admin transfer:**
   - Current user must be active admin
   - New admin must be active company member
   - Cannot transfer to yourself

3. **Before rejoining:**
   - Must have previous membership record
   - Cannot rejoin if already active
   - May require admin approval

## Database Queries

### Check if company has other active members (for admin transfer)
```typescript
const otherActiveMembers = await this.prisma.companyUser.findMany({
  where: {
    companyId,
    userId: { not: currentAdminUserId },
    isActive: true
  }
});
```

### Get current admin(s) of a company
```typescript
const admins = await this.prisma.companyUser.findMany({
  where: {
    companyId,
    role: CompanyRole.admin,
    isActive: true
  },
  include: { user: true }
});
```

## Migration Commands

After updating the schema, run:
```bash
npx prisma migrate dev --name add_company_membership_history
npx prisma generate
```
