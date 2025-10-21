# Edit Functionality Guide

This document explains the edit functionality for jobs and proposals in the ConnectO platform.

## Overview

The edit functionality allows:
- **Clients** to edit their posted jobs
- **Service Providers** to edit their submitted proposals

This feature is similar to popular freelance platforms like Upwork and Freelancer, giving users flexibility to update their postings before they're finalized.

## Features Implemented

### 1. Edit Job (Clients)

**File**: `frontend/src/pages/EditJob.tsx`

**Route**: `/jobs/:id/edit`

**Access**: Only clients who own the job

**Features**:
- Pre-fills form with existing job data
- Same validation as job creation
- Cannot edit closed jobs
- Updates job using `jobService.updateJob()`

**Editable Fields**:
- Title
- Description
- Category
- Budget
- Deadline
- Location (City, Area, Address)

**Access Control**:
- User must be logged in as a client
- User must own the job (job.client._id === currentUser._id)
- Job status must be "open" (cannot edit closed jobs)

**UI Integration**:
- "Edit Job" button added to Jobs.tsx for job owners
- Button appears with orange styling next to "View Details" button
- Only visible when currentUser owns the job

### 2. Edit Proposal (Service Providers)

**File**: `frontend/src/pages/EditProposal.tsx`

**Route**: `/proposals/:id/edit`

**Access**: Only providers who own the proposal

**Features**:
- Pre-fills form with existing proposal data
- Same validation as proposal creation
- Cannot edit accepted or rejected proposals
- Updates proposal using `proposalService.updateProposal()`

**Editable Fields**:
- Cover Letter
- Proposed Budget
- Estimated Duration

**Access Control**:
- User must be logged in as a provider
- User must own the proposal (proposal.provider._id === currentUser._id)
- Proposal status must be "pending" (cannot edit accepted/rejected proposals)

### 3. My Proposals Page

**File**: `frontend/src/pages/MyProposals.tsx`

**Route**: `/my-proposals`

**Access**: Service providers only

**Features**:
- Lists all proposals submitted by the provider
- Filter by status: All, Pending, Accepted, Rejected
- Pagination support (10 proposals per page)
- Shows job details for each proposal
- "Edit Proposal" button for pending proposals
- "View Job" button to see the original job posting

**Statistics Display**:
- Total Proposals count
- Pending count
- Accepted count
- Rejected count

## Backend Support

Both job and proposal edit functionality use existing backend endpoints:

### Job Update Endpoint
```
PUT /api/jobs/:id
Authorization: Client only
```

### Proposal Update Endpoint
```
PUT /api/proposals/:id
Authorization: Provider only (own proposals)
```

Both endpoints have proper authorization middleware ensuring users can only edit their own content.

## User Flow

### For Clients (Editing Jobs):

1. Navigate to Jobs page (`/jobs`)
2. Find your posted job in the list
3. Click "Edit Job" button (only visible for jobs you own)
4. Update job details in the form
5. Click "Update Job" to save changes
6. Redirected back to Jobs page with success message

### For Providers (Editing Proposals):

1. Navigate to My Proposals page (`/my-proposals`)
2. Find the proposal you want to edit
3. Click "Edit Proposal" button (only visible for pending proposals)
4. Update proposal details in the form
5. Click "Update Proposal" to save changes
6. Redirected back to Jobs page with success message

## Validation Rules

### Job Editing:
- Title: Minimum 10 characters
- Description: Minimum 50 characters
- Category: Must be selected
- Budget: Must be greater than 0
- Deadline: Must be in the future
- City and Area: Required fields

### Proposal Editing:
- Cover Letter: Minimum 50 characters
- Proposed Budget: Must be greater than 0
- Estimated Duration: Required field

## Security Considerations

1. **Authorization**: Both edit pages verify user ownership before allowing edits
2. **Status Checks**: Cannot edit jobs/proposals in certain states (closed, accepted, rejected)
3. **Backend Validation**: Server-side checks ensure users can only modify their own content
4. **Data Integrity**: All validation rules from creation are applied to updates

## Testing Checklist

- [ ] Login as client and edit own job
- [ ] Verify client cannot edit other users' jobs
- [ ] Verify client cannot edit closed jobs
- [ ] Login as provider and edit own proposal
- [ ] Verify provider cannot edit other users' proposals
- [ ] Verify provider cannot edit accepted proposals
- [ ] Verify provider cannot edit rejected proposals
- [ ] Test validation: Try submitting with invalid data
- [ ] Test navigation: Back buttons work correctly
- [ ] Test My Proposals page: Filters work correctly
- [ ] Test pagination in My Proposals page
- [ ] Verify success toasts appear after successful edits
- [ ] Verify error handling for network issues

## Code Files Modified

### New Files:
- `frontend/src/pages/EditJob.tsx` - Job edit page
- `frontend/src/pages/EditProposal.tsx` - Proposal edit page
- `frontend/src/pages/MyProposals.tsx` - Proposals listing page for providers

### Modified Files:
- `frontend/src/pages/Jobs.tsx` - Added "Edit Job" button for job owners
- `frontend/src/App.tsx` - Added routes for edit pages and My Proposals

### Existing Services Used:
- `frontend/src/services/jobService.ts` - `updateJob()` method
- `frontend/src/services/proposalService.ts` - `updateProposal()` and `getMyProposals()` methods

## Future Enhancements

1. **Add link to My Proposals** in header/dashboard for easy access
2. **Withdrawal feature** for proposals (allow providers to withdraw pending proposals)
3. **Edit history** tracking to see what changed and when
4. **Notification system** to alert clients when providers edit proposals
5. **Draft saving** to allow users to save edits without submitting
6. **Bulk actions** in My Proposals (withdraw multiple proposals at once)

## Notes

- Edit functionality respects the same business rules as creation
- Users receive clear feedback through toast notifications
- All edit pages have consistent UI/UX with the rest of the platform
- Proper loading states and error handling implemented throughout
