-- 1. Add a new column to the hustlers table that links to the secure auth system
ALTER TABLE hustlers 
ADD COLUMN user_id UUID REFERENCES auth.users(id);
-- 1.5 Give logged-in users the master key to enter the table
GRANT ALL ON hustlers TO authenticated;
-- 2. Create an aggressive security policy
-- This ensures a logged-in user can ONLY insert, update, or delete their OWN store
CREATE POLICY "Hustlers can manage their own store."
ON hustlers
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);