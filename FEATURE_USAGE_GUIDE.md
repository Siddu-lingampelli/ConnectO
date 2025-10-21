# Feature Usage Guide 📖

## Advanced Job Filters - Step by Step Guide

### Step 1: Access Job Filters
1. Login as a **Provider** (service provider/freelancer)
2. Navigate to **Browse Jobs** page
3. You'll see a search bar with a **"⚙️ Filters"** button

### Step 2: Open Filter Panel
Click the **"⚙️ Filters"** button to reveal the advanced filter options.

### Step 3: Available Filter Options

#### 📂 Category Filter
```
Dropdown options:
- All Categories (default)
- Plumbing
- Electrical
- Carpentry
- Painting
- Cleaning
- Gardening
- AC Repair
- Appliance Repair
- Pest Control
- Moving & Packing
- Home Renovation
- Interior Design
- Beauty & Wellness
- IT & Tech Support
- Other Services
```

#### 🏙️ City Filter
```
Dropdown options:
- All Cities (default)
- Mumbai
- Delhi
- Bangalore
- Hyderabad
- Chennai
- Kolkata
- Pune
- Ahmedabad
- Jaipur
- Lucknow
```

#### 💼 Provider Type Filter (NEW!)
```
Dropdown options:
- All Types (default)
- 💻 Technical (for online/remote technical work)
- 🔧 Non-Technical (for field/on-site work)
```

**Use Case:**
- If you're a software developer → Select "Technical"
- If you're a plumber/electrician → Select "Non-Technical"

#### 💰 Budget Type Filter (NEW!)
```
Dropdown options:
- All Types (default)
- Fixed Price (one-time project fee)
- Hourly Rate (per hour payment)
```

**Use Case:**
- Prefer one-time projects → Select "Fixed Price"
- Prefer hourly work → Select "Hourly Rate"

#### 💵 Budget Range Filters (NEW!)
```
Two input fields:
1. Min Budget (₹) - Enter minimum amount
2. Max Budget (₹) - Enter maximum amount
```

**Examples:**
```
Example 1: Budget-conscious
Min: 5000
Max: 15000
Result: Only jobs between ₹5,000 and ₹15,000

Example 2: High-value projects only
Min: 50000
Max: (leave empty)
Result: Only jobs above ₹50,000

Example 3: Small tasks
Min: (leave empty)
Max: 10000
Result: Only jobs under ₹10,000
```

### Step 4: Apply Filters
Filters apply automatically when you change any selection. No need to click "Apply"!

### Step 5: Clear Filters
Click **"Clear Filters"** button to reset all filters to default values.

---

## Recommended Jobs - How It Works

### What Are Recommended Jobs? 🎯

Recommended jobs are specially selected for you based on your profile information:
- ✅ Your provider type (Technical/Non-Technical)
- ✅ Your preferred job categories
- ✅ Your listed skills
- ✅ Your location

### Where to Find Them?

1. Login as a **Provider**
2. Go to **Browse Jobs** page
3. Look for the **"✨ Recommended For You"** section at the top (purple gradient background)

### Recommendation Section Features

```
Visual Layout:
┌─────────────────────────────────────────────────────────┐
│ ✨ Recommended For You  [Based on your profile]    [✕] │
├─────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐                   │
│  │ Job 1  │  │ Job 2  │  │ Job 3  │                   │
│  │        │  │        │  │        │                   │
│  └────────┘  └────────┘  └────────┘                   │
│                                                         │
│  + 5 more recommended jobs below                       │
└─────────────────────────────────────────────────────────┘
```

### Each Recommended Job Card Shows:

1. **Job Title** (truncated if too long)
2. **Category Badge** (blue badge, e.g., "Plumbing")
3. **Provider Type Badge** (💻 Technical or 🔧 Non-Technical)
4. **Job Description** (preview, first 2 lines)
5. **Budget** (formatted: ₹5.0K, ₹1.2L, etc.)
6. **Location** (city name with 📍 icon)

### How to Use Recommended Jobs

1. **Browse Recommendations**: Scroll through the top 3 cards
2. **Click to View**: Click any card to see full job details
3. **See More**: Scroll down to see all recommended jobs in the main list
4. **Hide Section**: Click the **[✕]** button to hide recommendations

---

## Filter Combinations Examples 💡

### Example 1: Technical Developer Looking for Hourly Work
```
Filters:
- Provider Type: 💻 Technical
- Budget Type: Hourly Rate
- Category: IT & Tech Support
- Min Budget: 500 (per hour)
- Max Budget: 2000 (per hour)

Result: Remote technical jobs with hourly rates ₹500-₹2000
```

### Example 2: Local Plumber in Mumbai
```
Filters:
- Provider Type: 🔧 Non-Technical
- Category: Plumbing
- City: Mumbai
- Budget Type: Fixed Price
- Min Budget: 1000
- Max Budget: 5000

Result: Plumbing jobs in Mumbai with budget ₹1K-₹5K
```

### Example 3: High-Value Renovation Projects
```
Filters:
- Category: Home Renovation
- Budget Type: Fixed Price
- Min Budget: 50000
- Max Budget: (leave empty)

Result: Major renovation projects above ₹50,000
```

### Example 4: Quick Small Tasks
```
Filters:
- Max Budget: 5000
- Budget Type: Fixed Price
- City: Bangalore

Result: Small fixed-price jobs under ₹5,000 in Bangalore
```

---

## Recommendation Algorithm Explained 🧠

### How Jobs Are Recommended:

```
Priority 1: Provider Type Match
If your profile has providerType = "Technical"
→ Shows only Technical jobs

Priority 2: Category Match
If your preferredCategories = ["Plumbing", "Electrical"]
→ Shows jobs in these categories

Priority 3: Skill Match
If your skills = ["Python", "JavaScript", "React"]
→ Shows jobs mentioning these skills in title/description

Priority 4: Location Match
If your city = "Mumbai"
→ Prioritizes jobs in Mumbai

Fallback: Recent Jobs
If no matches found
→ Shows most recently posted jobs
```

### Example Recommendation Scenarios:

#### Scenario A: Perfect Match
```
Your Profile:
- Provider Type: Technical
- Skills: ["Web Development", "React", "Node.js"]
- City: Bangalore
- Preferred Categories: ["IT & Tech Support"]

Recommended Job:
- Title: "React Developer for E-commerce Website"
- Category: IT & Tech Support
- Provider Type: Technical
- Location: Bangalore
- Budget: ₹50,000 Fixed

Match Reason: ✅ All criteria matched!
```

#### Scenario B: Partial Match
```
Your Profile:
- Provider Type: Non-Technical
- Skills: ["Plumbing", "Pipe Fitting"]
- City: Delhi

Recommended Job:
- Title: "Bathroom Plumbing Repair"
- Category: Plumbing
- Provider Type: Non-Technical
- Location: Mumbai (not Delhi)
- Budget: ₹3,000 Fixed

Match Reason: ✅ Provider type + Skills matched
```

#### Scenario C: No Match (Fallback)
```
Your Profile:
- Provider Type: Technical
- Skills: ["Blockchain Development"]
- City: Jaipur

Available Jobs: Only plumbing and cleaning jobs

Recommended Jobs:
→ Shows most recent jobs regardless of type

Message: "Showing recent jobs"
```

---

## Tips for Better Recommendations 💡

### Optimize Your Profile:

1. **Set Provider Type**
   - Go to Profile → Edit
   - Choose "Technical" or "Non-Technical"
   
2. **Add Skills**
   - List all your skills in Profile
   - Be specific (e.g., "React", "Node.js" instead of just "Programming")

3. **Select Preferred Categories**
   - Choose job categories you're interested in
   - Up to 5 categories recommended

4. **Update Location**
   - Set your city to get local job recommendations
   - Set service radius for nearby jobs

5. **Complete Your Profile**
   - 100% profile completion = Better recommendations
   - Add experience, education, portfolio

---

## Troubleshooting 🔧

### "No recommendations showing"
**Solution:**
1. Complete your profile (provider type, skills, categories)
2. Refresh the page
3. Check if there are any open jobs available

### "Filters not working"
**Solution:**
1. Clear all filters and try again
2. Make sure you selected valid values
3. Refresh the page
4. Check your internet connection

### "Recommended jobs not relevant"
**Solution:**
1. Update your profile with accurate skills
2. Set correct provider type
3. Choose relevant preferred categories
4. Update your location

### "Too many/few results"
**Solution:**
- Too many: Add more filters (budget range, category, location)
- Too few: Remove some filters or increase budget range

---

## Keyboard Shortcuts ⌨️

- **Enter** in search box → Trigger search
- **Esc** (when filters open) → Close filter panel
- **Click outside** filter panel → Close filters

---

## Mobile Usage 📱

All features are fully responsive:
- Filters stack vertically on mobile
- Recommended jobs show 1 card per row
- Touch-friendly buttons and dropdowns
- Swipe-friendly card layout

---

## Performance Tips ⚡

1. **Use Specific Filters**: More specific = Faster results
2. **Limit Budget Range**: Narrow ranges load faster
3. **Choose Categories**: Don't use "All Categories" for large datasets
4. **Pagination**: Results are paginated (20 per page)

---

## Privacy & Data Usage 🔒

- ✅ Recommendations based only on your profile data
- ✅ No personal information shared with job posters
- ✅ Filter preferences not saved (reset on page reload)
- ✅ Search queries not tracked
- ✅ Your profile data remains private

---

## Coming Soon 🚀

Features in development:
- Save filter presets
- Email alerts for new recommended jobs
- Advanced ML-based recommendations
- Job match percentage indicator
- Recommended jobs widget on dashboard
- One-click apply to recommended jobs

---

**Happy Job Hunting! 🎉**

Need help? Contact support or check the main documentation.
