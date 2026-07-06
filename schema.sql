-- 1. Table for Hustlers (The Sellers)
CREATE TABLE hustlers (
  id SERIAL PRIMARY KEY,
  store_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  whatsapp_number TEXT UNIQUE NOT NULL,
  city TEXT DEFAULT 'Kochi',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table for Listings (The Products)
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  hustler_id INTEGER REFERENCES hustlers(id),
  title TEXT NOT NULL,
  price DECIMAL(10, 2),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table for Inquiries (The Bridge)
CREATE TABLE inquiries (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id),
  user_phone TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);