# Complete API Endpoints Reference

## Authentication (`/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with phone/password
- `POST /auth/send-otp` - Send OTP for phone verification
- `POST /auth/verify-otp` - Verify OTP
- `GET /auth/profile` - Get current user profile

## Users (`/users`)
- `POST /users` - Create user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Companies (`/companies`)
- `POST /companies` - Create company
- `GET /companies` - Get all companies (supports `?ownerId` filter)
- `GET /companies/code/:companyCode` - Get company by code
- `GET /companies/:id` - Get company by ID
- `PATCH /companies/:id` - Update company
- `DELETE /companies/:id` - Delete company

## Company Documents (`/company-documents`) ✨ NEW
- `POST /company-documents` - Create document
- `GET /company-documents` - Get all documents (supports `?companyId` filter)
- `GET /company-documents/by-type?companyId=&docType=` - Get by type
- `GET /company-documents/:id` - Get document by ID
- `PATCH /company-documents/:id` - Update document
- `DELETE /company-documents/:id` - Delete document

## Company Users (`/company-users`)
- `POST /company-users` - Add user to company
- `GET /company-users` - Get all company users
- `GET /company-users/:id` - Get company user by ID
- `GET /company-users/history/:userId` - Get user's company history
- `GET /company-users/:companyId/admin-history` - Get admin transfer history
- `GET /company-users/:companyId/admins` - Get company admins
- `GET /company-users/:companyId/active-members` - Get active members
- `PATCH /company-users/:id` - Update company user
- `DELETE /company-users/:id` - Remove from company
- `POST /company-users/leave` - User leaves company
- `POST /company-users/rejoin` - User rejoins company
- `POST /company-users/transfer-admin` - Transfer admin role
- `POST /company-users/admin-leave` - Admin leaves company

## Locations (`/locations`)
- `POST /locations` - Create location
- `GET /locations` - Get all locations (supports `?companyId` filter) ✨ ENHANCED
- `GET /locations/:id` - Get location by ID
- `PATCH /locations/:id` - Update location
- `DELETE /locations/:id` - Delete location

## Shift Templates (`/shift-templates`)
- `POST /shift-templates` - Create shift template
- `GET /shift-templates` - Get all templates (supports `?companyId` filter) ✨ ENHANCED
- `GET /shift-templates/:id` - Get template by ID
- `PATCH /shift-templates/:id` - Update template
- `DELETE /shift-templates/:id` - Delete template

## Rosters (`/rosters`)
- `POST /rosters` - Create roster
- `POST /rosters/bulk` - Bulk create rosters ✨ NEW
- `GET /rosters` - Get all rosters
- `GET /rosters/company/:companyId` - Get rosters by company (with filters) ✨ NEW
  - Query params: `?status`, `?locationId`, `?companyUserId`, `?from`, `?to`
- `GET /rosters/location/:locationId` - Get rosters by location ✨ NEW
  - Query params: `?from`, `?to`
- `GET /rosters/user/:companyUserId` - Get rosters by user ✨ NEW
  - Query params: `?from`, `?to`
- `GET /rosters/duty-hours/company/:companyId` - Get duty hours by company
  - Query params: `?from`, `?to`
- `GET /rosters/duty-hours/user/:companyUserId` - Get duty hours by user
  - Query params: `?from`, `?to`
- `GET /rosters/:id` - Get roster by ID
- `PATCH /rosters/:id` - Update roster
- `PATCH /rosters/:id/complete` - Mark roster as completed ✨ NEW
- `PATCH /rosters/:id/cancel` - Mark roster as cancelled ✨ NEW
- `PATCH /rosters/:id/mark-missed` - Mark roster as missed ✨ NEW
- `DELETE /rosters/:id` - Delete roster

## Shift Attachments (`/shift-attachments`) ✨ NEW
- `POST /shift-attachments` - Create attachment
- `POST /shift-attachments/bulk` - Bulk create attachments
- `GET /shift-attachments` - Get all attachments (supports `?rosterId`, `?fileType`)
- `GET /shift-attachments/:id` - Get attachment by ID
- `PATCH /shift-attachments/:id` - Update attachment
- `DELETE /shift-attachments/:id` - Delete attachment

## Attendance (`/attendance`)
- `POST /attendance` - Create attendance record
- `POST /attendance/check-in` - Check in to shift ✨ NEW
- `POST /attendance/check-out` - Check out from shift ✨ NEW
- `GET /attendance` - Get all attendance
- `GET /attendance/roster/:rosterId` - Get attendance by roster ✨ NEW
- `GET /attendance/user/:companyUserId` - Get attendance by user ✨ NEW
  - Query params: `?from`, `?to`
- `GET /attendance/:id` - Get attendance by ID
- `PATCH /attendance/:id` - Update attendance
- `DELETE /attendance/:id` - Delete attendance

## Notifications (`/notifications`)
- `POST /notifications` - Create notification
- `POST /notifications/bulk` - Bulk create notifications ✨ NEW
- `GET /notifications` - Get all notifications
- `GET /notifications/user/:userId` - Get notifications by user ✨ NEW
  - Query params: `?isRead=true/false`
- `GET /notifications/user/:userId/unread-count` - Get unread count ✨ NEW
- `GET /notifications/:id` - Get notification by ID
- `PATCH /notifications/:id` - Update notification
- `PATCH /notifications/:id/mark-read` - Mark as read ✨ NEW
- `PATCH /notifications/:id/mark-sent` - Mark as sent ✨ NEW
- `PATCH /notifications/user/:userId/mark-all-read` - Mark all as read ✨ NEW
- `DELETE /notifications/:id` - Delete notification

## Shift Adverts (`/shift-adverts`)
- `POST /shift-adverts` - Create shift advert
- `GET /shift-adverts` - Get all shift adverts (with filters)
  - Query params: `?companyId`, `?status`, `?jobTitle`, `?jobType`, `?from`, `?to`
- `GET /shift-adverts/location/:locationId` - Get adverts by location ✨ NEW
  - Query params: `?from`, `?to`
- `GET /shift-adverts/:id/responses` - Get all responses ✨ NEW
- `GET /shift-adverts/:id/willing-responses` - Get willing responses ✨ NEW
- `POST /shift-adverts/:id/respond` - Respond to shift advert
- `POST /shift-adverts/:id/accept` - Accept a response and create roster
- `PATCH /shift-adverts/:id/cancel` - Cancel shift advert ✨ NEW
- `PATCH /shift-adverts/:id/close` - Close shift advert ✨ NEW

---

## Legend
- ✨ **NEW** - Newly implemented endpoint or module
- ✨ **ENHANCED** - Existing endpoint with new features/filters

## Common Query Parameters
- `from` - Start date filter (ISO 8601 format)
- `to` - End date filter (ISO 8601 format)
- `companyId` - Filter by company ID
- `locationId` - Filter by location ID
- `companyUserId` - Filter by company user ID
- `status` - Filter by status (varies by entity)
- `isRead` - Filter by read status (true/false)

## Status Enums
- **RosterStatus**: `ASSIGNED`, `COMPLETED`, `MISSED`, `CANCELLED`
- **ShiftAdvertStatus**: `OPEN`, `CLOSED`, `CANCELLED`
- **ShiftAdvertResponseStatus**: `WILLING`, `IGNORED`
- **CompanyRole**: `admin`, `manager`, `employee`
- **JobType**: `CASUAL`, `FULL_TIME`, `PART_TIME`
