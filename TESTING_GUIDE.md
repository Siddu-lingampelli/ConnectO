# 🧪 Provider Type System - Testing Guide

## Quick Test Scenarios

### ✅ Test 1: Technical Provider - Happy Path
**Objective**: Create a complete technical provider profile

**Steps**:
1. Navigate to profile creation
2. **BasicInfoStep**:
   - Name: "Rahul Kumar"
   - Phone: "9876543210"
   - Address: "Mumbai, Maharashtra"
   - **Provider Type**: Select "Technical" ✓
   - Click "Next Step"

3. **ServicesStep**:
   - Verify: ONLY Technical services visible
   - Categories shown: Software Development, Design, Writing, Marketing, Business Support
   - Categories hidden: Home Services, Events, Cleaning, Tutoring, Health
   - Check badge shows: "💻 Technical Services"
   - Select: Web Development, Mobile App Development, UI/UX Design
   - Click "Next Step"

4. **SkillsStep**:
   - Check badge shows: "💻 Technical Skills"
   - Verify: Technical skill categories visible
   - Categories: Programming Languages, Frontend, Backend, Mobile, Database, Design, Marketing, Writing, Business, DevOps
   - Click category: "Frontend Development"
   - Add skills: React, Angular, Vue.js (click each)
   - Click category: "Programming Languages"
   - Add skills: JavaScript, TypeScript, Python
   - Or type custom skill: "Redux"
   - Experience: 5 years
   - Hourly Rate: ₹800
   - Availability: Monday-Friday, Flexible
   - Click "Next Step"

5. **DocumentsStep**:
   - Upload ID Proof (optional)
   - Upload Address Proof (optional)
   - Upload Certifications (optional)
   - Click "Complete Profile 🎉"

**Expected Result**: ✅ Profile created successfully with Technical tag

---

### ✅ Test 2: Non-Technical Provider - Happy Path
**Objective**: Create a complete non-technical provider profile

**Steps**:
1. Navigate to profile creation
2. **BasicInfoStep**:
   - Name: "Suresh Singh"
   - Phone: "9123456789"
   - Address: "Delhi, India"
   - **Provider Type**: Select "Non-Technical" ✓
   - Click "Next Step"

3. **ServicesStep**:
   - Verify: ONLY Non-Technical services visible
   - Categories shown: Home Services, Events, Cleaning, Tutoring, Health
   - Categories hidden: Software Development, Design, Writing, Marketing
   - Check badge shows: "🔧 Non-Technical Services"
   - Select: Plumbing, Pipe Fitting, Leak Repair
   - Click "Next Step"

4. **SkillsStep**:
   - Check badge shows: "🔧 Non-Technical Skills"
   - Verify: Non-Technical skill categories visible
   - Categories: Home Services, Cleaning, Events, Tutoring, Health, Pet Care, Beauty, Automotive, Delivery, Security
   - Click category: "Home Services"
   - Add skills: Plumbing, Pipe Fitting, Leak Repair, Electrical Work
   - Experience: 10 years
   - Hourly Rate: ₹400
   - Availability: All Days, By Appointment
   - Click "Next Step"

5. **DocumentsStep**:
   - Upload documents
   - Click "Complete Profile 🎉"

**Expected Result**: ✅ Profile created successfully with Non-Technical tag

---

### ❌ Test 3: Validation - No Provider Type
**Objective**: Verify validation when provider type not selected

**Steps**:
1. **BasicInfoStep**:
   - Fill name, phone, address
   - **Leave Provider Type empty**
   - Click "Next Step"

**Expected Result**: ❌ Error toast: "Please select provider type"

2. Move to ServicesStep manually (if possible):
   - **Expected**: Warning message displayed
   - **Expected**: Service selection disabled
   - Text: "⚠️ Please select a provider type in the previous step"

3. Move to SkillsStep manually (if possible):
   - **Expected**: Warning message displayed
   - **Expected**: Skill buttons disabled
   - **Expected**: Input field disabled

---

### ❌ Test 4: Skill Limits
**Objective**: Test maximum skill limit

**Steps**:
1. Complete BasicInfoStep with "Technical"
2. Complete ServicesStep
3. **SkillsStep**:
   - Add 15 skills (click 15 different skill suggestions)
   - **Expected**: Counter shows "15/15 skills"
   - Try to add 16th skill
   - **Expected**: Warning toast: "Maximum 15 skills allowed"

---

### ❌ Test 5: Duplicate Skills
**Objective**: Test duplicate skill prevention

**Steps**:
1. Complete BasicInfoStep and ServicesStep
2. **SkillsStep**:
   - Click "React" skill
   - **Expected**: Success toast "Added React"
   - Click "React" again
   - **Expected**: Error toast "Skill already added"

---

### 🔄 Test 6: Back Button Functionality
**Objective**: Verify data persists when going back

**Steps**:
1. **BasicInfoStep**: Fill all fields, select "Technical"
2. **ServicesStep**: Select 3 services
3. **SkillsStep**: Add 5 skills, fill experience/rate
4. Click "← Back"
5. **Expected**: Return to ServicesStep with selected services preserved
6. Click "← Back"
7. **Expected**: Return to BasicInfoStep with "Technical" still selected

---

### 🔄 Test 7: Provider Type Switch (Edge Case)
**Objective**: Test what happens if provider type changes

**Steps**:
1. **BasicInfoStep**: Select "Technical"
2. **ServicesStep**: Select "Web Development"
3. Go back to BasicInfoStep
4. Change to "Non-Technical"
5. Return to ServicesStep
6. **Expected**: Technical services hidden, Non-Technical services shown
7. **Expected**: Previous selection (Web Development) cleared or not shown

---

### 📱 Test 8: Mobile Responsiveness
**Objective**: Test on mobile screen sizes

**Steps**:
1. Open browser DevTools
2. Switch to mobile view (375px width)
3. Complete entire flow
4. **Expected**: 
   - 2-column grid for categories
   - Easy tap targets for skills
   - No horizontal scrolling
   - Buttons fully visible

---

### 🎨 Test 9: Visual Indicators
**Objective**: Verify all visual elements display correctly

**Steps**:
1. Check provider type badges:
   - Technical: 💻 Blue background (bg-blue-100 text-blue-700)
   - Non-Technical: 🔧 Green background (bg-green-100 text-green-700)

2. Check skill pills:
   - Added skills: Green background (bg-green-100)
   - Available skills: White with border
   - Hover effect: Blue highlight

3. Check category buttons:
   - Unselected: Gray border
   - Selected: Blue border with blue background
   - Hover: Blue border

---

### 📝 Test 10: Custom Skill Input
**Objective**: Verify custom skill input still works

**Steps**:
1. Complete BasicInfoStep with "Technical"
2. Complete ServicesStep
3. **SkillsStep**:
   - Type custom skill in input: "GraphQL"
   - Click "Add" or press Enter
   - **Expected**: Skill added successfully
   - Type another: "Docker Swarm"
   - **Expected**: Success toast
   - Check: Custom skills mixed with suggested skills

---

## 🐛 Bug Checklist

### Critical Issues to Watch For:
- [ ] Provider type not persisting across steps
- [ ] Wrong service categories showing for selected type
- [ ] Skills showing for wrong provider type
- [ ] Duplicate skills being added
- [ ] More than 15 skills being added
- [ ] Form submission with empty provider type
- [ ] Back button losing data
- [ ] TypeScript compilation errors
- [ ] Console errors in browser

### UI/UX Issues to Watch For:
- [ ] Badges not displaying or wrong colors
- [ ] Category buttons not highlighting when selected
- [ ] Skill pills not showing remove button
- [ ] Warning messages not visible
- [ ] Disabled state not clear
- [ ] Mobile layout breaking
- [ ] Text overflow or truncation
- [ ] Icons not displaying (💻 🔧)

---

## 📊 Success Criteria

### All Tests Pass If:
✅ Technical providers see ONLY technical options  
✅ Non-Technical providers see ONLY non-technical options  
✅ Provider type validation prevents proceeding without selection  
✅ Skill limit enforced (max 15)  
✅ Duplicate skills prevented  
✅ Back button preserves data  
✅ Visual indicators display correctly  
✅ Mobile layout works perfectly  
✅ Custom skills can be added  
✅ No console errors or TypeScript errors  

---

## 🚀 Quick Smoke Test (2 Minutes)

**For rapid verification before deployment:**

1. ✅ Select "Technical" → See technical services → Add technical skills → Complete
2. ✅ Select "Non-Technical" → See non-technical services → Add non-technical skills → Complete
3. ✅ Try to skip provider type → Get error
4. ✅ Add 16th skill → Get warning
5. ✅ Add duplicate skill → Get error
6. ✅ Click back button → Data preserved

**If all 6 pass**: ✅ System ready for production!

---

## 🔧 Development Testing Commands

### Frontend
```bash
cd "a:\DT project\SIH 18 try\final 4\frontend"
npm run dev
```
Access at: http://localhost:3011

### Backend
```bash
cd "a:\DT project\SIH 18 try\final 4\backend"
npm start
```
Access at: http://localhost:5000

### Check for Errors
```bash
# TypeScript compilation check
cd frontend
npm run build

# Linting
npm run lint
```

---

## 📸 Screenshots to Capture

1. ✅ BasicInfoStep with provider type dropdown
2. ✅ ServicesStep showing Technical services with badge
3. ✅ ServicesStep showing Non-Technical services with badge
4. ✅ SkillsStep with category selection (Technical)
5. ✅ SkillsStep with skill suggestions displayed
6. ✅ SkillsStep with added skills (green pills)
7. ✅ Warning message when no provider type selected
8. ✅ Success toast when skill added
9. ✅ Error toast for duplicate skill
10. ✅ Mobile view of the entire flow

---

## 🎯 Performance Testing

### Load Time Checks:
- [ ] BasicsInfoStep loads < 500ms
- [ ] ServicesStep loads < 500ms
- [ ] SkillsStep loads < 500ms
- [ ] Category selection response < 100ms
- [ ] Skill addition response < 100ms

### Memory Checks:
- [ ] No memory leaks when navigating back/forth
- [ ] Skill arrays properly managed
- [ ] State updates efficient

---

## ✅ Final Checklist Before Production

- [ ] All 10 test scenarios pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Mobile responsive tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Performance acceptable
- [ ] Screenshots documented
- [ ] User documentation ready
- [ ] Backend API tested
- [ ] Database schema verified

---

## 🎉 Testing Complete!

If all tests pass, the system is:
- ✅ **Production-Ready**
- ✅ **Error-Free**
- ✅ **User-Friendly**
- ✅ **Professional**
- ✅ **Scalable**

**Ready to deploy!** 🚀
