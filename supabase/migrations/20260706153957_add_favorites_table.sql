-- 1. Create a junction table linking users to the products they favorite
CREATE TABLE favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- The MAGIC line: This prevents a user from favoriting the exact same product twice!
  UNIQUE(user_id, listing_id) 
);

-- 2. Give logged-in users access to this table
GRANT ALL ON favorites TO authenticated;

-- 3. Turn on Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 4. Create a bouncer policy: Users can only see, add, or delete their OWN favorites
CREATE POLICY "Users can manage their own favorites"
ON favorites
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);