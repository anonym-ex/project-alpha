-- 1. Enable RLS on all tables (Safety check)
ALTER TABLE hustlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 2. Anyone can VIEW hustlers
CREATE POLICY "Public read access for hustlers" 
ON hustlers FOR SELECT USING (true);

-- 3. Anyone can VIEW listings
CREATE POLICY "Public read access for listings" 
ON listings FOR SELECT USING (true);

-- 4. Anyone can CREATE an inquiry (The WhatsApp Bridge)
CREATE POLICY "Public can insert inquiries" 
ON inquiries FOR INSERT WITH CHECK (true);

-- 5. GRANT table access to the API 
GRANT SELECT ON hustlers TO anon;
GRANT SELECT ON listings TO anon;
GRANT INSERT ON inquiries TO anon;