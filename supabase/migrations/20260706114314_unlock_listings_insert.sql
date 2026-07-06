-- 1. Give logged-in users the master key to enter the listings table
GRANT ALL ON listings TO authenticated;

-- 2. Create the security policy
-- This complex looking query simply checks: "Does the hustler_id on this new product match a store that belongs to the currently logged-in user?"
CREATE POLICY "Store owners can manage their own products"
ON listings
FOR ALL
TO authenticated
USING (
  hustler_id IN (SELECT id FROM hustlers WHERE user_id = auth.uid())
)
WITH CHECK (
  hustler_id IN (SELECT id FROM hustlers WHERE user_id = auth.uid())
);