-- CivicIssue Database Schema Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'supervisor', 'worker')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed', 'rejected')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  location JSONB NOT NULL,
  images TEXT[] DEFAULT '{}',
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  assigned_to TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  votes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('issue_status', 'comment', 'assignment', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table (for admin dashboard)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  user_id TEXT,
  user_name TEXT,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_issues_user_id ON issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_votes_issue_id ON votes(issue_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for issues table
DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update vote count
CREATE OR REPLACE FUNCTION update_issue_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE issues SET votes = votes + 1 WHERE id = NEW.issue_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE issues SET votes = votes - 1 WHERE id = OLD.issue_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for votes
DROP TRIGGER IF EXISTS update_votes_count ON votes;
CREATE TRIGGER update_votes_count
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_issue_votes();

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_issue_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE issues SET comments_count = comments_count + 1 WHERE id = NEW.issue_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE issues SET comments_count = comments_count - 1 WHERE id = OLD.issue_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments count
DROP TRIGGER IF EXISTS update_comments_count ON comments;
CREATE TRIGGER update_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_issue_comments_count();

-- Function to create activity log
CREATE OR REPLACE FUNCTION log_issue_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activities (type, title, description, user_id, user_name, issue_id, metadata)
    VALUES (
      'issue_created',
      'New Issue Reported',
      NEW.title,
      NEW.user_id,
      NEW.user_name,
      NEW.id,
      jsonb_build_object('category', NEW.category, 'priority', NEW.priority)
    );

    -- Create notification for issue reporter confirming receipt
    INSERT INTO notifications (user_id, type, title, message, issue_id)
    VALUES (
      NEW.user_id,
      'system',
      'Issue Reported Successfully',
      'Your issue "' || NEW.title || '" has been received and is under review',
      NEW.id
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO activities (type, title, description, user_id, user_name, issue_id, metadata)
      VALUES (
        'status_changed',
        'Issue Status Updated',
        NEW.title,
        NEW.user_id,
        NEW.user_name,
        NEW.id,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );

      -- Create notification for issue reporter
      INSERT INTO notifications (user_id, type, title, message, issue_id)
      VALUES (
        NEW.user_id,
        'issue_status',
        'Issue Status Updated',
        'Your issue "' || NEW.title || '" status changed to ' || NEW.status,
        NEW.id
      );
    END IF;

    IF OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL THEN
      INSERT INTO activities (type, title, description, user_id, user_name, issue_id, metadata)
      VALUES (
        'issue_assigned',
        'Issue Assigned',
        NEW.title,
        NEW.assigned_to,
        'Admin',
        NEW.id,
        jsonb_build_object('assigned_to', NEW.assigned_to)
      );

      -- Create notification for issue reporter about assignment
      INSERT INTO notifications (user_id, type, title, message, issue_id)
      VALUES (
        NEW.user_id,
        'assignment',
        'Issue Assigned',
        'Your issue "' || NEW.title || '" has been assigned to ' || NEW.assigned_to,
        NEW.id
      );
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for issue activities
DROP TRIGGER IF EXISTS log_issue_changes ON issues;
CREATE TRIGGER log_issue_changes
  AFTER INSERT OR UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION log_issue_activity();

-- Function to create comment notification
CREATE OR REPLACE FUNCTION notify_comment()
RETURNS TRIGGER AS $$
DECLARE
  issue_record RECORD;
BEGIN
  SELECT * INTO issue_record FROM issues WHERE id = NEW.issue_id;

  -- Notify issue reporter if comment is from someone else
  IF issue_record.user_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, issue_id)
    VALUES (
      issue_record.user_id,
      'comment',
      'New Comment',
      NEW.user_name || ' commented on your issue: ' || issue_record.title,
      NEW.issue_id
    );
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment notifications
DROP TRIGGER IF EXISTS notify_on_comment ON comments;
CREATE TRIGGER notify_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);

-- RLS Policies for issues table
DROP POLICY IF EXISTS "Anyone can view issues" ON issues;
CREATE POLICY "Anyone can view issues" ON issues FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create issues" ON issues;
CREATE POLICY "Authenticated users can create issues" ON issues FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own issues" ON issues;
CREATE POLICY "Users can update own issues" ON issues FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own issues" ON issues;
CREATE POLICY "Users can delete own issues" ON issues FOR DELETE USING (true);

-- RLS Policies for comments table
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (true);

-- RLS Policies for votes table
DROP POLICY IF EXISTS "Anyone can view votes" ON votes;
CREATE POLICY "Anyone can view votes" ON votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON votes;
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can remove own votes" ON votes;
CREATE POLICY "Users can remove own votes" ON votes FOR DELETE USING (true);

-- RLS Policies for notifications table
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (true);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- RLS Policies for activities table
DROP POLICY IF EXISTS "Anyone can view activities" ON activities;
CREATE POLICY "Anyone can view activities" ON activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert activities" ON activities;
CREATE POLICY "System can insert activities" ON activities FOR INSERT WITH CHECK (true);

-- Insert some sample data for testing
INSERT INTO issues (title, description, category, status, priority, location, user_id, user_name, user_email)
VALUES
  ('Pothole on Main Street', 'Large pothole causing traffic issues and potential vehicle damage', 'road', 'pending', 'high', '{"lat": 23.3441, "lng": 85.3096, "address": "Main Street, Ranchi"}', 'demo-user-1', 'Demo User', 'demo@example.com'),
  ('Broken Street Light', 'Street light not working for 3 days in residential area', 'lighting', 'in_progress', 'medium', '{"lat": 23.3568, "lng": 85.3347, "address": "Circular Road, Ranchi"}', 'demo-user-2', 'Test User', 'test@example.com'),
  ('Garbage Pile Up', 'Garbage not collected for over a week', 'sanitation', 'pending', 'high', '{"lat": 23.3629, "lng": 85.2793, "address": "Lalpur, Ranchi"}', 'demo-user-1', 'Demo User', 'demo@example.com')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables: users, issues, comments, votes, notifications, activities';
  RAISE NOTICE 'Indexes, triggers, and RLS policies configured';
  RAISE NOTICE 'Sample data inserted';
END $$;
