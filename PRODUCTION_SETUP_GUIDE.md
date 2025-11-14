# 🚀 CivicIssue Production Setup Guide

Complete guide to set up and deploy your CivicIssue platform for production.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Firebase account
- Supabase account
- Expo account (for user app)
- Git installed

---

## 🗄️ Step 1: Database Setup

### 1.1 Run SQL Schema

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `gwflrcmaxivxphsdkyyy`
3. Go to **SQL Editor**
4. Open the file `supabase-setup.sql` from the project root
5. Copy and paste the entire content
6. Click **Run** to execute
7. Verify tables are created in **Table Editor**

Expected tables:
- `users`
- `issues`
- `comments`
- `votes`
- `notifications`
- `activities`

### 1.2 Setup Storage Bucket

Follow instructions in `supabase-storage-setup.md`:

1. Go to **Storage** in Supabase Dashboard
2. Create new bucket: `issues`
3. Make it **public**
4. Run storage policies SQL from the guide
5. Test upload

---

## 🔥 Step 2: Firebase Setup

Your Firebase project is already configured:
- Project ID: `nagarmitram`
- Auth domain: `nagarmitram.firebaseapp.com`

### Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **nagarmitram**
3. Go to **Authentication** → **Sign-in method**
4. Enable **Email/Password**
5. (Optional) Enable **Google Sign-in** for easier auth

### Storage Rules (if using Firebase Storage)

```firebase
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 💻 Step 3: Admin Panel Setup

### 3.1 Install Dependencies

```bash
cd /Users/Sadique/CivicIssue_adminpanel
npm install
```

### 3.2 Environment Variables

Your `.env.local` is already configured. Verify it contains:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCZY-9Nckdjxxwy9YRL85Q7AxuXWf2C4IU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nagarmitram.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nagarmitram
# ... (rest of Firebase config)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gwflrcmaxivxphsdkyyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_USER_APP_URL=http://localhost:19000

# AI Services (Optional)
GROQ_API_KEY=gsk_...
```

### 3.3 Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3001`

### 3.4 Build for Production

```bash
npm run build
npm start
```

### 3.5 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Set up and deploy: Y
# - Which scope: Your account
# - Link to existing project: N
# - Project name: civicissue-admin
# - Directory: ./
# - Override settings: N

# Add environment variables in Vercel Dashboard
```

---

## 📱 Step 4: User App Setup

### 4.1 Install Dependencies

```bash
cd /Users/Sadique/CivicIssue_adminpanel/CivicIssue_userapp
npm install
```

### 4.2 Environment Variables

Your `.env` is configured. Verify:

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCZY-9Nckdjxxwy9YRL85Q7AxuXWf2C4IU
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=nagarmitram.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=nagarmitram
# ... (rest of Firebase config)

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://gwflrcmaxivxphsdkyyy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API URL (not needed anymore - using direct Supabase)
# EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

### 4.3 Run Development

```bash
npm start

# Options:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Scan QR code with Expo Go app on physical device
```

### 4.4 Build for Production

#### Android (APK)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure
eas build:configure

# Build APK
eas build --platform android --profile preview

# Build AAB (for Google Play)
eas build --platform android --profile production
```

#### iOS (TestFlight/App Store)

```bash
# Requires Apple Developer Account ($99/year)

# Build for TestFlight
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

---

## 🧪 Step 5: Testing the Setup

### Test Flow

1. **Create Admin Account**
   - Go to admin panel: `http://localhost:3001/login`
   - Click "Sign Up"
   - Create account with email/password
   - Login

2. **Create User Account (Mobile App)**
   - Open user app
   - Click "Sign Up"
   - Create different account
   - Login

3. **Report Issue (Mobile)**
   - Click "Report Issue"
   - Select category
   - Add title, description
   - Allow location access
   - Take/upload photo
   - Submit

4. **View in Admin Panel**
   - Refresh admin dashboard
   - See new issue appear
   - Click to view details

5. **Update Issue Status**
   - Change status to "in_progress"
   - Assign to team member
   - Save changes

6. **Check Notifications (Mobile)**
   - User should see notification
   - Status update should reflect

7. **Add Comment (Mobile)**
   - Open issue details
   - Add comment
   - See comment appear

8. **Vote on Issue**
   - Click vote button
   - See count increase

---

## 🔒 Security Checklist

### Before Production

- [ ] Change all default passwords
- [ ] Rotate API keys if exposed
- [ ] Enable Supabase RLS (already done)
- [ ] Add rate limiting to Firebase
- [ ] Set up proper CORS headers
- [ ] Enable HTTPS only
- [ ] Add authentication middleware
- [ ] Set up backup procedures
- [ ] Configure monitoring/alerts
- [ ] Review Firebase Security Rules

### Firebase Security Rules Example

```javascript
{
  "rules": {
    ".read": false,
    ".write": false,
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

## 📊 Monitoring & Analytics

### Supabase Dashboard

Monitor:
- API requests/sec
- Database size
- Active connections
- Error rates

### Firebase Console

Track:
- Authentication users
- Auth errors
- Storage usage

### Application Logs

Check logs for:
- Failed API calls
- Database errors
- Authentication issues

---

## 🐛 Troubleshooting

### Issue: "Table does not exist"
**Solution**: Run `supabase-setup.sql` again

### Issue: "Permission denied" on image upload
**Solution**:
1. Verify storage bucket is public
2. Check RLS policies are created
3. Ensure user is authenticated

### Issue: "Firebase auth failed"
**Solution**:
1. Check Firebase config in .env
2. Verify Email/Password is enabled
3. Check network connection

### Issue: User app can't connect
**Solution**:
1. Verify all EXPO_PUBLIC_ env vars are set
2. Restart Expo dev server
3. Clear Expo cache: `expo start -c`

### Issue: Admin panel shows no data
**Solution**:
1. Check Supabase connection
2. Verify RLS policies allow reads
3. Check browser console for errors

---

## 🚀 Performance Optimization

### Admin Panel

1. **Image Optimization**
   ```bash
   npm install next-image-export-optimizer
   ```

2. **Bundle Analysis**
   ```bash
   npm run analyze
   ```

3. **Caching Strategy**
   - Enable Vercel Edge Caching
   - Set up Redis for sessions
   - Use SWR for data fetching

### User App

1. **Reduce Bundle Size**
   - Remove unused dependencies
   - Use Hermes engine (Android)
   - Enable ProGuard (Android)

2. **Image Optimization**
   - Compress images before upload
   - Use WebP format
   - Lazy load images

3. **Offline Support**
   - Enable AsyncStorage caching
   - Add offline indicators
   - Queue actions when offline

---

## 📦 Backup Strategy

### Database Backups

Supabase automatically backs up daily. For manual backups:

```sql
-- Export tables
pg_dump -h db.gwflrcmaxivxphsdkyyy.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup_$(date +%Y%m%d).dump
```

### Firebase Backup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Export data
firebase auth:export users.json --project nagarmitram
```

---

## 🎯 Next Steps

### Recommended Enhancements

1. **Push Notifications**
   - Set up Firebase Cloud Messaging (FCM)
   - Configure Expo Push Notifications
   - Send notifications on status changes

2. **Analytics**
   - Add Google Analytics
   - Track user journeys
   - Monitor issue resolution times

3. **Email Notifications**
   - Set up SendGrid/Mailgun
   - Send email on issue updates
   - Weekly digest emails

4. **Admin Features**
   - Bulk actions
   - Export reports (CSV/PDF)
   - Advanced filtering
   - Role-based permissions

5. **User Features**
   - Issue search with filters
   - Save favorite locations
   - Share issues to social media
   - Follow issue updates

---

## 📞 Support

For issues or questions:
- Check documentation in `/docs`
- Review error logs
- Consult Supabase/Firebase docs
- Check GitHub issues

---

## ✅ Production Launch Checklist

- [ ] Database schema deployed
- [ ] Storage buckets configured
- [ ] RLS policies enabled
- [ ] Firebase auth enabled
- [ ] Admin panel deployed
- [ ] User app built
- [ ] Test user created
- [ ] Sample data verified
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Security audit done
- [ ] Performance tested
- [ ] Documentation updated

---

**You're ready for production!** 🎉

Last updated: October 2025
