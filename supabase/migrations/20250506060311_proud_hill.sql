/*
  # Add saved menus functionality
  
  1. New Table
    - `saved_menus`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `restaurant_id` (uuid, references profiles)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS
    - Add policies for customers to manage their saved menus
    - Add policy for restaurants to view who saved their menu
*/

-- Create saved menus table
CREATE TABLE saved_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  -- Ensure a user can't save the same restaurant multiple times
  UNIQUE(user_id, restaurant_id)
);

-- Enable Row Level Security
ALTER TABLE saved_menus ENABLE ROW LEVEL SECURITY;

-- Customers can view their saved menus
CREATE POLICY "Users can view their saved menus"
  ON saved_menus FOR SELECT
  USING (auth.uid() = user_id);

-- Customers can save/unsave menus
CREATE POLICY "Users can save menus"
  ON saved_menus FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'customer'
    )
  );

CREATE POLICY "Users can unsave menus"
  ON saved_menus FOR DELETE
  USING (auth.uid() = user_id);

-- Restaurants can see who saved their menu
CREATE POLICY "Restaurants can view saves of their menu"
  ON saved_menus FOR SELECT
  USING (
    restaurant_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'restaurant'
    )
  );

-- Create index for better performance
CREATE INDEX saved_menus_user_id_idx ON saved_menus(user_id);
CREATE INDEX saved_menus_restaurant_id_idx ON saved_menus(restaurant_id);