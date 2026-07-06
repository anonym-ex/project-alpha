-- 1. Ensure the defense system is turned on for the listings table
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- 2. Let the public ('anon') role inside the room
GRANT SELECT ON listings TO anon;

-- 3. Unlock the glass cases so the public can look at the products
CREATE POLICY "Products are viewable by everyone."
ON listings FOR SELECT
TO anon
USING (true);