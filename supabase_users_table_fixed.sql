-- Create users table to store all registered users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL, -- Firebase UID
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('admin', 'staff', 'citizen')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  location TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create policies
-- Allow everyone to read user data (for public profiles)
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert user data (for registration from mobile app)
CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to update any user data (can be restricted later)
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  TO public
  USING (true);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE users IS 'Stores all registered users from Firebase Auth';
