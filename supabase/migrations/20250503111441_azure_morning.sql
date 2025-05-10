/*
  # Create storage bucket for menu item images
  
  1. New Storage
    - Creates a public bucket for menu item images
    - Sets up storage policies for restaurant owners
*/

-- Create public storage bucket for menu items
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true);

-- Allow authenticated users to upload images
CREATE POLICY "Restaurant owners can upload menu images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-items' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'restaurant'
  )
);

-- Allow restaurant owners to update their own images
CREATE POLICY "Restaurant owners can update their images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu-items' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'restaurant'
  )
);

-- Allow restaurant owners to delete their images
CREATE POLICY "Restaurant owners can delete their images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-items' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'restaurant'
  )
);

-- Allow public access to menu item images
CREATE POLICY "Menu item images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menu-items');