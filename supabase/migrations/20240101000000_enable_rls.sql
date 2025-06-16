-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Posts table policies
CREATE POLICY "Users can view posts from their college" 
  ON posts FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE users.college = posts.college
    )
  );

CREATE POLICY "Users can create posts for their college"
  ON posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    college IN (
      SELECT college FROM users 
      WHERE id = auth.uid()
    )
  );

-- Allow public access to the profiles table (read-only)
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT 
  USING (true);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE 
  USING (auth.uid() = id);
