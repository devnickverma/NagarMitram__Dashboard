# ⚡ CivicIssue Quick Start Guide

Get your CivicIssue platform running in 10 minutes!

---

## 🎯 What You'll Do

1. Set up database (2 min)
2. Run admin panel (2 min)
3. Run user app (2 min)
4. Test everything (4 min)

---

## 1️⃣ Database Setup (2 minutes)

### Open Supabase Dashboard

1. Go to: https://app.supabase.com
2. Find project: `gwflrcmaxivxphsdkyyy`
3. Click **SQL Editor**

### Run Schema

1. Open file: `supabase-setup.sql` (in project root)
2. Copy ALL content
3. Paste in SQL Editor
4. Click **RUN**
5. Wait for success message ✅

### Create Storage Bucket

1. Go to **Storage** tab
2. Click **New bucket**
3. Name: `issues`
4. Check ☑️ **Public bucket**
5. Click **Create**

Done! ✅

---

## 2️⃣ Admin Panel (2 minutes)

### Terminal 1 - Install & Run

```bash
cd /Users/Sadique/CivicIssue_adminpanel
npm install
npm run dev
```

### Open Browser

Visit: http://localhost:3001

### Create Account

1. Click "Sign Up"
2. Enter:
   - Name: Your Name
   - Email: admin@example.com
   - Password: admin123 (or your choice)
3. Click "Create Account"

You're in! ✅

---

## 3️⃣ User App (2 minutes)

### Terminal 2 - Install & Run

```bash
cd /Users/Sadique/CivicIssue_adminpanel/CivicIssue_userapp
npm install
npm start
```

### Open on Phone/Emulator

**Option A - Physical Device:**
1. Install "Expo Go" app from App Store/Play Store
2. Scan QR code from terminal

**Option B - Simulator:**
- iOS: Press `i` in terminal
- Android: Press `a` in terminal

Done! ✅

---

## 4️⃣ Test Everything (4 minutes)

### Test 1: Report an Issue (User App)

1. In user app, click "Sign Up" (create different account than admin)
2. After login, click "Report Issue"
3. Select category: "🚧 Road"
4. Add title: "Test Pothole"
5. Add description: "Testing the app"
6. Allow location access
7. Click "Submit Report"
8. See success message ✅

### Test 2: View in Admin (Web)

1. Go to admin panel (http://localhost:3001)
2. Check dashboard - see your issue appear!
3. Click on the issue
4. See all details ✅

### Test 3: Update Status (Web)

1. In issue details, find status dropdown
2. Change to "In Progress"
3. Click "Save" or similar
4. See status update ✅

### Test 4: Add Comment (Mobile)

1. In user app, go to "My Issues"
2. Tap your test issue
3. Scroll to comments
4. Type: "This is a test comment"
5. Click send icon
6. See comment appear ✅

### Test 5: Vote (Mobile)

1. In issue details, tap the ⬆️ vote button
2. See number increase
3. Button should turn green ✅

---

## 🎉 Success!

If all 5 tests passed, you're ready!

### What's Working:

✅ Database with all tables
✅ Firebase authentication
✅ Real-time data sync
✅ Image uploads
✅ Comments system
✅ Voting system
✅ Status updates
✅ Notifications (in database)

---

## 🐛 Something Not Working?

### Admin panel won't start

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### User app connection error

```bash
# Restart with clean cache
expo start -c
```

### No data showing

1. Check Supabase SQL ran successfully
2. Verify .env files have correct URLs
3. Refresh the page/app

### Can't upload images

1. Verify storage bucket `issues` exists
2. Check it's marked as PUBLIC
3. Run storage policies SQL (in supabase-storage-setup.md)

---

## 📚 Next Steps

Now that it's working:

1. **Read Full Guide**: `PRODUCTION_SETUP_GUIDE.md`
2. **Customize**: Update colors, logo, text
3. **Add Data**: Create more test issues
4. **Invite Team**: Share admin panel URL
5. **Deploy**: Follow production deployment guide

---

## 🚀 Quick Commands Reference

### Admin Panel

```bash
npm run dev      # Start development
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Check code quality
```

### User App

```bash
npm start        # Start Expo
npm run android  # Open Android
npm run ios      # Open iOS
expo start -c    # Clear cache
```

---

## 💡 Pro Tips

1. **Keep both terminals running** while developing
2. **Use Chrome DevTools** for admin panel debugging
3. **Use Expo DevTools** for mobile app debugging
4. **Create test accounts** for different user types
5. **Check browser console** for any errors

---

## ✅ Verification Checklist

Before moving to production:

- [ ] SQL schema executed successfully
- [ ] Storage bucket created
- [ ] Admin panel loads without errors
- [ ] Can create admin account
- [ ] Can login to admin
- [ ] User app loads on device
- [ ] Can create user account
- [ ] Can report an issue
- [ ] Issue appears in admin
- [ ] Can update issue status
- [ ] Can add comments
- [ ] Can vote on issues
- [ ] Real-time updates work

---

**Happy Building!** 🎊

Need help? Check `PRODUCTION_SETUP_GUIDE.md` for detailed instructions.
