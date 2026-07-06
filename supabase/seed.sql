-- 1. Insert Fake Hustlers
INSERT INTO hustlers (id, store_name, owner_name, whatsapp_number, city, category)
VALUES 
  (1, 'KochiBakes', 'Aisha', '+919876543210', 'Kochi', 'Bakery'),
  (2, 'Resin & Wood', 'Rahul', '+919876543211', 'Kochi', 'Crafts');

-- 2. Insert Fake Listings
INSERT INTO listings (hustler_id, title, price, image_url)
VALUES 
  (1, 'Custom Chocolate Truffle Cake', 1500.00, 'https://example.com/cake.jpg'),
  (1, 'Box of 6 Brownies', 450.00, 'https://example.com/brownies.jpg'),
  (2, 'Ocean Blue Resin Wall Clock', 2200.00, 'https://example.com/clock.jpg');