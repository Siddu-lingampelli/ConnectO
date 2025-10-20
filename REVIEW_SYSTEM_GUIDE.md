# Review & Feedback System Guide

## Overview
The review system allows clients to leave feedback and ratings for service providers after completing a job. This helps build trust and provides transparency in the platform.

## Features

### For Clients
1. **Leave Reviews**: After completing a job, clients can rate and review the service provider
2. **Rating Categories**:
   - Overall Rating (1-5 stars)
   - Quality of Work
   - Communication
   - Timeliness
   - Professionalism
3. **Written Feedback**: Provide detailed comments about the experience
4. **One Review Per Order**: Clients can only review each completed order once

### For Service Providers
1. **View Reviews**: See all reviews received from clients
2. **Respond to Reviews**: Add professional responses to reviews
3. **Rating Updates**: Overall provider rating is automatically calculated from all reviews
4. **Review Statistics**: View detailed stats including star distribution

## How to Use

### As a Client

#### Leaving a Review
1. Go to **"Ongoing Work"** from the navigation menu
2. Find the completed job you want to review
3. Click **"View Details"**
4. After the job is completed, you'll see a **"⭐ Leave a Review"** button
5. Click the button to open the review modal
6. Fill in:
   - Overall star rating (1-5)
   - Category ratings (Quality, Communication, Timeliness, Professionalism)
   - Written review (minimum 10 characters)
7. Click **"Submit Review"**
8. You'll see **"✅ Review Submitted"** confirmation

#### When Can You Review?
- Only after the order status is "completed"
- Only for orders where you are the client
- One review per order (cannot submit multiple reviews)

### As a Service Provider

#### Viewing Your Reviews
1. Go to your profile page
2. Reviews will be displayed with:
   - Client name and profile picture
   - Star rating
   - Review comment
   - Date posted
   - Category ratings

#### Responding to Reviews
1. Find the review you want to respond to
2. Click **"Respond"**
3. Write your professional response
4. Click **"Submit Response"**
5. Your response will appear below the review

## API Endpoints

### Create Review
```
POST /api/reviews
Body: {
  orderId: string,
  rating: number (1-5),
  comment: string,
  categories: {
    quality: number,
    communication: number,
    timeliness: number,
    professionalism: number
  }
}
```

### Get Provider Reviews
```
GET /api/reviews/provider/:providerId?page=1&limit=10
```

### Get Order Review
```
GET /api/reviews/order/:orderId
```

### Update Review
```
PUT /api/reviews/:reviewId
Body: { rating, comment, categories }
```

### Delete Review
```
DELETE /api/reviews/:reviewId
```

### Add Response (Provider)
```
POST /api/reviews/:reviewId/response
Body: { comment: string }
```

## Database Schema

### Review Model
```javascript
{
  order: ObjectId (ref: Order),
  job: ObjectId (ref: Job),
  reviewer: ObjectId (ref: User), // Client
  reviewee: ObjectId (ref: User), // Provider
  rating: Number (1-5),
  comment: String,
  categories: {
    quality: Number,
    communication: Number,
    timeliness: Number,
    professionalism: Number
  },
  response: {
    comment: String,
    createdAt: Date
  },
  isVisible: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Rating Calculation

Provider's overall rating is automatically updated when:
- A new review is submitted
- A review is updated
- A review is deleted

Formula: Average of all visible reviews, rounded to 1 decimal place

## Validation Rules

### Creating a Review
- Order must exist and be completed
- User must be the client of the order
- Cannot review the same order twice
- Rating must be between 1-5
- Comment must be at least 10 characters
- Category ratings (optional) must be between 1-5

### Updating/Deleting a Review
- Only the reviewer (client) can update or delete their own review
- Cannot change the order or reviewee

### Adding a Response
- Only the reviewee (provider) can respond to reviews about them
- One response per review

## Features Included

### Frontend Components
- `ReviewModal.tsx` - Modal for creating/editing reviews
- Review display in OrderDetails page
- Review submission button for completed orders
- Review success indicator

### Backend
- `Review.model.js` - Review database schema
- `review.controller.js` - All review operations
- `review.routes.js` - API endpoints
- Automatic rating calculation

### Services
- `reviewService.ts` - Frontend API integration

## Security & Permissions

### Access Control
- Only authenticated users can create/update/delete reviews
- Clients can only review orders they posted
- Providers can only respond to their own reviews
- Public can view provider reviews

### Data Validation
- Rating range validation (1-5)
- Comment length validation (min 10, max 1000 characters)
- One review per order (unique index)
- Order completion verification

## Testing Checklist

### As Client
- [ ] Complete a job with a provider
- [ ] Navigate to Order Details
- [ ] Click "Leave a Review" button
- [ ] Fill in all ratings and comment
- [ ] Submit review successfully
- [ ] See "Review Submitted" confirmation
- [ ] Verify cannot submit duplicate review

### As Provider
- [ ] Check your profile for reviews
- [ ] View review statistics
- [ ] View individual reviews
- [ ] Add response to a review
- [ ] Verify rating updated in profile

### System Validation
- [ ] Provider rating updates automatically
- [ ] Review count increases
- [ ] Review appears on provider profile
- [ ] Cannot review incomplete orders
- [ ] Cannot review other people's orders

## Troubleshooting

### "You can only review completed orders"
- Wait for the provider to mark the order as complete
- Then accept the delivery as a client

### "You have already reviewed this order"
- Each order can only be reviewed once
- Edit your existing review instead

### "Failed to submit review"
- Check that you're logged in as a client
- Verify the order belongs to you
- Ensure the order is completed
- Check comment is at least 10 characters

## Future Enhancements
- Review photos/attachments
- Helpful votes on reviews
- Report inappropriate reviews
- Featured/highlighted reviews
- Review reminders
- Star distribution graph on provider profile
- Filter reviews by rating
- Sort reviews by date/rating
