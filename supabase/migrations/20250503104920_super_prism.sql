/*
  # Fix Profile RLS Policies

  1. Changes
    - Add RLS policy to allow users to create their own profile during registration
    - Remove admin user deletion during registration cleanup
    - Keep existing policies for profile viewing and updates

  2. Security
    - Users can only create their own profile where id matches their auth.uid()
    - Maintains existing RLS policies for viewing and updating profiles
*/

-- Add policy to allow users to create their own profile during registration
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);