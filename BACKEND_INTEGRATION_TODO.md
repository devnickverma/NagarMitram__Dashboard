# Backend Integration TODO

## 📋 Components Using Demo Data (Need Backend Integration)

### ⚠️ **Dashboard Components:**

#### 1. **StatsGrid** (`components/Dashboard/StatsGrid.tsx`)
- **Issue**: Uses hardcoded demo stats instead of real API data
- **Current**: Shows static numbers for total issues, resolved issues, etc.
- **Fix Needed**: Connect to real stats API endpoint

#### 2. **ActivityFeed** (`components/Dashboard/ActivityFeed.tsx`) 
- **Issue**: `const displayActivities = demoActivities;` (line 84)
- **Current**: Shows static activities (Issue Resolved, Team Dispatched, etc.)
- **Fix Needed**: Connect to real activity/audit log API
- **Real-time**: Should update when new activities occur

#### 3. **PriorityQueue** (`components/Dashboard/PriorityQueue.tsx`)
- **Issue**: `const displayIssues = demoIssues;` (line 38)
- **Current**: Shows static high-priority issues
- **Fix Needed**: Connect to real issues API with priority filter
- **Real-time**: Should update when new high-priority issues are reported

#### 4. **IssuesTable** (`components/Dashboard/IssuesTable.tsx`)
- **Issue**: `const displayIssues = issues && issues.length > 0 ? issues : demoIssues;` (line 128)
- **Current**: Falls back to demo issues when API fails
- **Fix Needed**: Ensure API connection is stable and returns real data
- **Real-time**: Should update when issues are reported/updated/resolved

### 📊 **Other Pages with Similar Issues:**

#### 5. **Users Management** (`app/users/page.tsx`)
- **Issue**: Uses `mockUsers` as initial state
- **Current**: Add/Remove works locally but doesn't persist
- **Fix Needed**: Connect to real user management API
- **Features**: CRUD operations need backend persistence

#### 6. **Issues Management** (`app/issues/page.tsx`)
- **Status**: Likely uses demo data - needs verification
- **Fix Needed**: Connect to real issues management API

#### 7. **Analytics** (`app/analytics/page.tsx`)
- **Status**: Likely uses demo chart data - needs verification
- **Fix Needed**: Connect to real analytics/reporting API

#### 8. **Reports** (`app/reports/page.tsx`)
- **Status**: Likely uses demo report data - needs verification
- **Fix Needed**: Connect to real report generation API

## 🔧 **Why We Did This:**
These were temporary fixes to solve **rendering issues** where:
- Components were flickering/disappearing
- Conditional rendering (`data?.length > 0 ? realData : demoData`) was causing UI instability
- Empty states weren't handled properly

## ✅ **Next Steps to Fix:**

### **Phase 1: API Integration**
1. **Verify backend API endpoints** are working and returning proper data structure
2. **Fix API response handling** to ensure consistent data format
3. **Add proper error handling** and loading states

### **Phase 2: Smart Fallbacks**
```javascript
// Instead of: const displayData = demoData;
// Use this pattern:
const displayData = useMemo(() => {
  if (loading) return [];
  if (error) return demoData; // Only fallback on error
  return realData?.length > 0 ? realData : demoData;
}, [loading, error, realData]);
```

### **Phase 3: Real-time Updates**
1. **WebSocket integration** for live updates
2. **State management** with proper data synchronization
3. **Optimistic updates** for better UX

## 🎯 **Critical for Production:**
All these components need to be connected to real backend APIs before going live, otherwise the admin panel won't reflect actual civic issue data or allow real management operations.

## 📝 **Development Notes:**
- Demo data was used to fix UI rendering issues
- All styling and functionality is working correctly
- Only data source needs to be switched from demo to real API
- Consider using React Query or SWR for better data fetching and caching