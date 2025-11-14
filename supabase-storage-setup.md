# Supabase Storage Setup Guide

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `gwflrcmaxivxphsdkyyy`
3. Click on "Storage" in the left sidebar
4. Click "New bucket"
5. Enter the following details:
   - **Name**: `issues`
   - **Public bucket**: ✅ Check this (we need public URLs for images)
   - Click "Create bucket"

## Step 2: Set Bucket Policies (Run in SQL Editor)

Go to SQL Editor and run this:

```sql
-- Allow public read access to issues bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'issues');

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'issues' AND auth.role() = 'authenticated');

-- Allow users to update their own uploads
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'issues' AND auth.uid()::text = owner);

-- Allow users to delete their own uploads
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'issues' AND auth.uid()::text = owner);
```

## Step 3: Configure CORS (Optional, if needed for web uploads)

In your Supabase Storage settings, add these CORS origins:
- `http://localhost:3001` (Admin Panel)
- `http://localhost:19000` (Expo Dev Server)
- Your production domain when deploying

## Step 4: Test Upload

Test that the storage is working by running this in your browser console (on admin panel):

```javascript
const { data, error } = await supabase.storage
  .from('issues')
  .upload('test.txt', new Blob(['Hello World'], { type: 'text/plain' }))

console.log('Upload result:', data, error)
```

## Folder Structure

The bucket will organize images like this:
```
issues/
  └── issue-images/
      ├── 1234567890_abc123.jpg
      ├── 1234567891_def456.png
      └── ...
```

## Storage Limits

- Free tier: 1 GB storage
- File size limit: 50 MB per file
- Consider upgrading if you expect many high-res images

## Troubleshooting

If uploads fail:
1. Check bucket name is exactly `issues`
2. Verify bucket is set to public
3. Ensure RLS policies are created
4. Check Supabase anon key is correct in .env files
