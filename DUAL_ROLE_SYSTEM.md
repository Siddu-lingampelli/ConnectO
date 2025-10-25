# Dual Role System Documentation

## Overview
The Dual Role System allows users to seamlessly switch between **Client** and **Provider** roles within a single account on the ConnectO platform. Users no longer need separate accounts for different roles.

## Features

### 1. **Role Management**
- Users can enable both Client and Provider roles
- Switch between roles with a single click
- Active role determines dashboard view and available features
- Role history is tracked for audit purposes

### 2. **Provider Role Requirements**
- Must select Provider Type (Technical/Non-Technical)
- Requires verification before accepting jobs
- Demo project verification required for full provider capabilities

### 3. **Persistent Role Selection**
- Active role is saved in the database
- Role persists across sessions and devices
- Header displays current active role badge

## Technical Architecture

### Backend

#### 1. User Model (`backend/models/User.model.js`)
```javascript
enabledRoles: [{
  type: String,
  enum: ['client', 'provider'],
  default: ['client']
}],
activeRole: {
  type: String,
  enum: ['client', 'provider', 'admin'],
  default: 'client'
},
roleHistory: [{
  role: String,
  enabledAt: Date
}]
```

#### 2. API Endpoints (`/api/role`)
- **PATCH `/api/role/switch`** - Switch between enabled roles
  - Body: `{ targetRole: 'provider' | 'client' }`
  - Returns: Updated user object with new activeRole

- **POST `/api/role/enable`** - Enable a new role
  - Body: `{ role: 'provider', providerType?: 'Technical' | 'Non-Technical' }`
  - Returns: Updated user with new role in enabledRoles array

- **GET `/api/role/status`** - Get current role capabilities
  - Returns: activeRole, enabledRoles, verification status, capabilities

- **DELETE `/api/role/disable/:role`** - Disable a role
  - Params: role to disable
  - Returns: Updated user without the disabled role

#### 3. Controller Logic (`backend/controllers/roleSwitch.controller.js`)
- Validates role switching permissions
- Checks verification status for provider role
- Prevents disabling active role
- Requires providerType when enabling provider role
- Updates both `activeRole` and legacy `role` fields for compatibility

### Frontend

#### 1. Type Definitions (`frontend/src/types/index.ts`)
```typescript
interface User {
  // ... existing fields
  enabledRoles?: ('client' | 'provider')[];
  activeRole?: 'client' | 'provider' | 'admin';
  roleHistory?: Array<{
    role: string;
    enabledAt: string;
  }>;
}
```

#### 2. Role Toggle Component (`frontend/src/components/role/RoleToggle.tsx`)
- Displays current active role badge
- Toggle switch for users with both roles
- "Enable Provider" button for clients
- Modal for provider type selection
- Automatic redirect to verification page

#### 3. Service Layer (`frontend/src/services/roleSwitchService.ts`)
```typescript
interface RoleStatus {
  activeRole: string;
  enabledRoles: string[];
  canSwitchToProvider: boolean;
  canSwitchToClient: boolean;
  isVerified: boolean;
  // ... other fields
}

class RoleSwitchService {
  switchRole(targetRole: string): Promise<ApiResponse>
  enableRole(data: EnableRoleData): Promise<ApiResponse>
  getRoleStatus(): Promise<ApiResponse<RoleStatus>>
  disableRole(role: string): Promise<ApiResponse>
}
```

#### 4. Integration Points

**Header Component** (`frontend/src/components/layout/Header.tsx`)
- Displays RoleToggle component for non-admin users
- Shows active role badge with color coding
- Updates in real-time when role changes

**Dashboard Component** (`frontend/src/pages/Dashboard.tsx`)
- Uses `activeRole` instead of `role` for conditional rendering
- Shows provider-specific features in provider mode
- Shows client-specific features in client mode
- Dynamically updates stats and quick actions

## User Flow

### Enabling Provider Role (First Time)

1. Client clicks "Enable Provider" button in header
2. Modal appears with provider type selection:
   - **Technical**: IT, Development, Design
   - **Non-Technical**: Plumbing, Cleaning, etc.
3. User selects provider type and confirms
4. System adds 'provider' to enabledRoles
5. User is redirected to verification page
6. After verification, user can switch to provider mode

### Switching Between Roles

1. User with both roles enabled sees toggle switch
2. Clicks toggle to switch (e.g., Client → Provider)
3. System validates:
   - Role is in enabledRoles
   - Provider role requires verification
4. activeRole is updated in database
5. Dashboard refreshes with new role view
6. Navigation and features update accordingly

### Role-Specific Features

**Client Mode:**
- ✅ Post jobs
- ✅ Browse service providers
- ✅ View posted jobs
- ✅ Manage hired providers
- ✅ Review completed work
- ❌ Cannot apply to jobs
- ❌ Cannot view provider dashboard

**Provider Mode:**
- ✅ Browse available jobs
- ✅ Submit proposals
- ✅ Accept collaboration invites
- ✅ View active work
- ✅ Demo project verification
- ❌ Cannot post jobs
- ❌ Cannot hire other providers

## Security & Validation

1. **Authentication Required**: All role endpoints require valid JWT token
2. **Role Validation**: 
   - Can only switch to enabled roles
   - Cannot disable active role
   - Must have at least one role enabled
3. **Verification Check**: Provider role requires `verification.status === 'verified'`
4. **Provider Type**: Provider role must have a valid providerType
5. **Database Integrity**: Uses `validateModifiedOnly: true` to prevent enum errors

## UI/UX Design

### Role Badge Display
- **Client Mode**: 🎯 Green badge with "Client" label
- **Provider Mode**: 💼 Blue badge with "Provider" label
- Toggle switch animates smoothly between roles
- Color-coded for instant recognition

### Modal Design
- Clean, modern interface
- Clear explanation of requirements
- Visual provider type selection with icons
- Prominent verification notice
- Responsive on all devices

### Dashboard Adaptation
- Welcome message changes based on role
- Stats reflect role-specific metrics
- Quick actions are role-appropriate
- Search functionality adapts to role
- No disruptive page reloads

## Testing Scenarios

### Test Case 1: New User (Client Only)
```
1. Register as client
2. Login → Dashboard shows client view
3. Click "Enable Provider" in header
4. Select provider type
5. Verify redirect to verification page
6. Complete verification
7. Switch to provider mode
8. Dashboard shows provider view
```

### Test Case 2: Provider Switching to Client
```
1. Provider with both roles enabled
2. Click toggle switch in header
3. Verify switch to client mode
4. Dashboard shows client features
5. Cannot see provider-specific options
6. Switch back to provider mode
7. Provider features restore
```

### Test Case 3: Unverified Provider
```
1. Enable provider role
2. Do NOT complete verification
3. Try to switch to provider mode
4. See verification required message
5. Redirect to verification page
6. Complete verification
7. Can now switch to provider mode
```

### Test Case 4: Role Persistence
```
1. Switch to provider mode
2. Logout
3. Login again
4. Verify still in provider mode
5. Dashboard shows provider view
6. Role persists across sessions
```

## API Response Examples

### Switch Role Success
```json
{
  "success": true,
  "message": "Successfully switched to provider mode",
  "data": {
    "user": {
      "_id": "...",
      "fullName": "John Doe",
      "activeRole": "provider",
      "enabledRoles": ["client", "provider"],
      "role": "provider"
    }
  }
}
```

### Enable Provider Role Success
```json
{
  "success": true,
  "message": "Provider role enabled successfully!",
  "data": {
    "user": {
      "_id": "...",
      "enabledRoles": ["client", "provider"],
      "providerType": "Technical",
      "roleHistory": [
        { "role": "client", "enabledAt": "2024-01-01T00:00:00Z" },
        { "role": "provider", "enabledAt": "2024-01-15T10:30:00Z" }
      ]
    }
  }
}
```

### Get Role Status
```json
{
  "success": true,
  "data": {
    "activeRole": "client",
    "enabledRoles": ["client", "provider"],
    "canSwitchToProvider": true,
    "canSwitchToClient": false,
    "isVerified": true,
    "providerType": "Technical",
    "verification": {
      "status": "verified"
    }
  }
}
```

## Future Enhancements

1. **Role-Based Permissions**
   - Fine-grained feature access control
   - Custom role capabilities
   - Role inheritance

2. **Analytics**
   - Track role switching patterns
   - Time spent in each role
   - Performance metrics per role

3. **Admin Features**
   - Force role changes for support
   - View user role history
   - Disable specific roles

4. **Enhanced UX**
   - Role switching animation
   - Guided onboarding for dual roles
   - Role-specific tutorials

## Migration Notes

### Backward Compatibility
- Legacy `role` field is still updated alongside `activeRole`
- Existing code checking `user.role` will continue to work
- Gradual migration to `activeRole` recommended

### Database Migration
No migration script needed. New fields have defaults:
- `enabledRoles`: defaults to `['client']`
- `activeRole`: defaults to existing `role` value
- `roleHistory`: empty array

## Support & Troubleshooting

### Common Issues

**Issue**: Cannot switch to provider mode
- **Solution**: Complete verification first

**Issue**: Toggle button not showing
- **Solution**: Enable provider role first

**Issue**: Dashboard not updating after switch
- **Solution**: Clear browser cache, reload page

**Issue**: Provider type required error
- **Solution**: Specify providerType when enabling provider role

## Credits
Developed as part of the ConnectO platform for SIH 2024.

---
Last Updated: January 2025
Version: 1.0.0
