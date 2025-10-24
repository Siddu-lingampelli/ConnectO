# Peer-to-Peer Collaboration Feature

## Overview
The Peer-to-Peer Collaboration feature allows service providers to invite other providers to work together on projects and share payments based on work contribution.

## Features

### 1. **Collaborator Management**
- Main provider can invite other providers to join their project
- Collaborators can accept or decline invitations
- Define roles and payment share percentages
- Track collaboration status (invited, accepted, declined)

### 2. **Payment Splits**
- Automatic payment distribution based on share percentages
- Total share must equal 100%
- Payment tracking for each collaborator
- Visual breakdown of earnings

### 3. **Privacy & Security**
- Only main provider and invited collaborators can view team details
- Client sees only the main provider
- Secure invitation system with status tracking

## Backend API

### Base URL
```
/api/collaboration
```

### Endpoints

#### 1. Invite Collaborator
```http
POST /projects/:id/inviteCollaborator
```

**Authorization:** Required (Main Provider only)

**Request Body:**
```json
{
  "providerId": "string",
  "role": "string (optional)",
  "sharePercent": number
}
```

**Response:**
```json
{
  "success": true,
  "message": "Collaborator invited successfully",
  "collaborators": [...]
}
```

**Validations:**
- Only assigned provider can invite
- Job must be in "in_progress" status
- Provider must exist and be a service provider
- Share percentage must be 1-100
- Total share cannot exceed 100%
- Cannot invite same provider twice
- Cannot invite yourself

#### 2. Respond to Invitation
```http
PATCH /projects/:id/collaborator/:cid/respond
```

**Authorization:** Required (Invited Provider only)

**Request Body:**
```json
{
  "response": "accepted" | "declined"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation accepted successfully",
  "collaborator": {...}
}
```

#### 3. Update Payment Splits
```http
PATCH /projects/:id/paymentSplits
```

**Authorization:** Required (Main Provider only)

**Request Body:**
```json
{
  "splits": [
    {
      "providerId": "string",
      "sharePercent": number
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment splits updated successfully",
  "paymentSplits": [...]
}
```

**Validations:**
- Total percentage must equal 100%
- All providers must be either main provider or accepted collaborators
- Amounts calculated automatically based on job budget

#### 4. Get Collaborators
```http
GET /projects/:id/collaborators
```

**Authorization:** Required (Main Provider or Collaborators only)

**Response:**
```json
{
  "success": true,
  "collaborators": [...],
  "mainProvider": {...}
}
```

#### 5. Remove Collaborator
```http
DELETE /projects/:id/collaborator/:cid
```

**Authorization:** Required (Main Provider or Self)

**Response:**
```json
{
  "success": true,
  "message": "Collaborator removed successfully"
}
```

**Note:** Can only remove invited or declined collaborators

## Database Schema

### Job Model Updates

```javascript
{
  // ... existing fields

  // Peer-to-Peer Collaboration
  collaborators: [{
    providerId: ObjectId (ref: 'User'),
    role: String (default: 'Collaborator'),
    sharePercent: Number (0-100),
    status: String (enum: ['invited', 'accepted', 'declined']),
    invitedAt: Date,
    respondedAt: Date
  }],

  // Payment Distribution
  paymentSplits: [{
    providerId: ObjectId (ref: 'User'),
    sharePercent: Number (0-100),
    amount: Number,
    isPaid: Boolean,
    paidAt: Date
  }]
}
```

## Frontend Components

### 1. CollaboratorList Component
**Path:** `frontend/src/components/collaboration/CollaboratorList.tsx`

**Props:**
```typescript
{
  jobId: string;
  budget: number;
  assignedProviderId: string;
  status: string;
}
```

**Features:**
- Display main provider with badge
- List all collaborators with status
- Accept/Decline invitation buttons
- Remove collaborator option
- Invite new collaborator button
- Calculate and display payment amounts

### 2. InviteCollaboratorModal Component
**Path:** `frontend/src/components/collaboration/InviteCollaboratorModal.tsx`

**Props:**
```typescript
{
  jobId: string;
  onClose: () => void;
  onSuccess: () => void;
}
```

**Features:**
- Input provider ID
- Specify role (optional)
- Set share percentage (1-100%)
- Real-time validation
- Success/error handling

## Frontend Service

### CollaborationService
**Path:** `frontend/src/services/collaborationService.ts`

**Methods:**
```typescript
// Invite a collaborator
inviteCollaborator(jobId: string, data: InviteCollaboratorData)

// Respond to invitation
respondToInvitation(jobId: string, collaboratorId: string, response: 'accepted' | 'declined')

// Update payment splits
updatePaymentSplits(jobId: string, data: UpdatePaymentSplitsData)

// Get all collaborators
getCollaborators(jobId: string)

// Remove a collaborator
removeCollaborator(jobId: string, collaboratorId: string)
```

## Usage Example

### In Job Details Page

```tsx
import CollaboratorList from '../components/collaboration/CollaboratorList';

// Inside your JobDetails component
<CollaboratorList
  jobId={job._id}
  budget={job.budget}
  assignedProviderId={job.assignedProvider?._id}
  status={job.status}
/>
```

### Integration Steps

1. **Import the component:**
```tsx
import CollaboratorList from '../components/collaboration/CollaboratorList';
```

2. **Add to your job details page:**
```tsx
{job.assignedProvider && (
  <CollaboratorList
    jobId={job._id}
    budget={job.budget}
    assignedProviderId={job.assignedProvider._id}
    status={job.status}
  />
)}
```

3. **Ensure proper permissions:**
- Only show to assigned provider and collaborators
- Client should not see this section

## Workflow

### 1. Invitation Flow
```
Main Provider → Invites Collaborator
              ↓
Collaborator receives notification
              ↓
Collaborator accepts/declines
              ↓
Status updated in database
```

### 2. Payment Distribution Flow
```
Project Completed
       ↓
Main Provider sets payment splits (must total 100%)
       ↓
System calculates amounts: (budget × sharePercent) / 100
       ↓
Payments marked as pending
       ↓
Admin/System processes payments
       ↓
Each provider receives their share
```

## Business Rules

1. **Invitation Rules:**
   - Only main provider can invite
   - Job must be in_progress
   - Cannot exceed 100% total share
   - Cannot invite same provider twice

2. **Response Rules:**
   - Only invited provider can respond
   - Can only respond once
   - Cannot change response after acceptance/decline

3. **Payment Rules:**
   - Total splits must equal 100%
   - Only main provider can set splits
   - Splits can only include main provider or accepted collaborators
   - Amounts auto-calculated based on budget

4. **Removal Rules:**
   - Main provider can remove invited/declined collaborators
   - Collaborators can remove themselves (decline)
   - Cannot remove accepted collaborators without updating splits first

## Security Considerations

1. **Authorization:**
   - All endpoints require authentication
   - Role-based access control implemented
   - Collaborator IDs verified against user session

2. **Data Privacy:**
   - Client cannot see collaborators
   - Only team members can view collaboration details
   - Provider IDs validated before operations

3. **Input Validation:**
   - Share percentages validated (0-100)
   - Total percentage checks
   - Provider existence verification
   - Status checks before operations

## Future Enhancements

1. **Team Chat:**
   - Real-time messaging between collaborators
   - File sharing within team
   - Project updates and notifications

2. **Task Assignment:**
   - Break down project into tasks
   - Assign tasks to specific collaborators
   - Track task completion

3. **Time Tracking:**
   - Log hours worked by each collaborator
   - Automatic payment calculation based on hours
   - Detailed work reports

4. **Performance Metrics:**
   - Track collaborator performance
   - Rating system within team
   - Collaboration history

5. **Payment Automation:**
   - Automatic payment processing
   - Escrow integration
   - Invoice generation

## Troubleshooting

### Common Issues

**1. "Total share percentage cannot exceed 100%"**
- Solution: Reduce existing shares before inviting new collaborators

**2. "Only the assigned provider can invite collaborators"**
- Solution: Ensure logged-in user is the main provider

**3. "Can only invite collaborators for in-progress jobs"**
- Solution: Wait until job status is changed to in_progress

**4. "Provider not found"**
- Solution: Verify the provider ID is correct

**5. "Cannot remove accepted collaborators"**
- Solution: Update payment splits to exclude the collaborator first

## Testing

### Manual Testing Checklist

- [ ] Main provider can invite collaborators
- [ ] Collaborator receives invitation
- [ ] Collaborator can accept invitation
- [ ] Collaborator can decline invitation
- [ ] Main provider can set payment splits
- [ ] Total percentage validation works
- [ ] Payment amounts calculate correctly
- [ ] Collaborator list displays properly
- [ ] Remove collaborator works
- [ ] Unauthorized users cannot access

### API Testing with Postman

1. **Setup:**
   - Create test users (1 client, 3 providers)
   - Create a test job
   - Assign job to provider 1

2. **Test Scenarios:**
   - Invite provider 2 (20% share)
   - Invite provider 3 (30% share)
   - Provider 2 accepts
   - Provider 3 declines
   - Set payment splits (Provider 1: 80%, Provider 2: 20%)
   - Verify calculations

## Support

For questions or issues:
1. Check this documentation
2. Review error messages in API responses
3. Check browser console for frontend errors
4. Review server logs for backend issues
5. Contact development team

---

**Version:** 1.0.0  
**Last Updated:** October 24, 2025  
**Author:** ConnectO Development Team
