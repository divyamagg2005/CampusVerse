-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, college)
  VALUES (NEW.id, NEW.email, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that fires on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Set up storage policies for post-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view post images
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'post-images');

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to their own folder"
ON storage.objects 
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-images' AND
  name LIKE auth.uid()::text || '/%'
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own uploads"
ON storage.objects 
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-images' AND
  name LIKE auth.uid()::text || '/%'
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own uploads"
ON storage.objects 
FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images' AND
  name LIKE auth.uid()::text || '/%'
);
