-- Geco Farm — Seed Data: Kenyan crop types, livestock breeds, and inventory categories

-- ============================================================
-- CROP TYPES (Common Kenyan crops)
-- ============================================================
insert into crop_types (name, variety, category, growing_season_days, description) values
  ('Maize', 'H614D', 'grain', 120, 'Most widely grown grain in Kenya'),
  ('Maize', 'DH04', 'grain', 90, 'Short-season drought-tolerant maize'),
  ('Beans', 'Rose Coco', 'legume', 90, 'Popular bean variety in Kenya'),
  ('Beans', 'Mwitemania', 'legume', 85, 'Early-maturing bean variety'),
  ('Wheat', 'Kenya Fahari', 'grain', 120, 'Bread wheat variety'),
  ('Rice', 'Basmati 370', 'grain', 150, 'Aromatic rice for Mwea scheme'),
  ('Rice', 'BW 196', 'grain', 130, 'High-yielding paddy rice'),
  ('Tea', 'Clone TRFK 6/8', 'cash_crop', null, 'High-yielding tea clone'),
  ('Coffee', 'Ruiru 11', 'cash_crop', null, 'Disease-resistant coffee variety'),
  ('Coffee', 'Batian', 'cash_crop', null, 'New high-yielding coffee variety'),
  ('Sukuma Wiki', 'Collard greens', 'vegetable', 60, 'Most consumed vegetable in Kenya'),
  ('Spinach', null, 'vegetable', 45, 'Popular leafy vegetable'),
  ('Tomatoes', 'Money Maker', 'vegetable', 75, 'Common tomato variety'),
  ('Tomatoes', 'Rio Grande', 'vegetable', 80, 'Processing tomato variety'),
  ('Onions', 'Red Creole', 'vegetable', 90, 'Popular onion variety'),
  ('Cabbage', 'Copenhagen Market', 'vegetable', 80, 'Head cabbage'),
  ('Potatoes', 'Shangi', 'tuber', 100, 'Most popular potato variety in Kenya'),
  ('Potatoes', 'Kenya Mpya', 'tuber', 110, 'High-yielding potato variety'),
  ('Sweet Potatoes', 'Kabode', 'tuber', 120, 'Orange-fleshed sweet potato'),
  ('Cassava', null, 'tuber', 300, 'Drought-tolerant tuber crop'),
  ('Bananas', 'Cavendish', 'fruit', 365, 'Dessert banana variety'),
  ('Bananas', 'Cooking banana', 'fruit', 365, 'East African Highland Banana'),
  ('Avocado', 'Hass', 'fruit', null, 'Popular export avocado variety'),
  ('Mango', 'Apple Mango', 'fruit', null, 'Sweet mango variety'),
  ('Pineapple', 'Smooth Cayenne', 'fruit', 540, 'Major pineapple variety'),
  ('Macadamia', null, 'cash_crop', null, 'High-value nut crop'),
  ('French Beans', 'Samantha', 'vegetable', 55, 'Export horticulture crop'),
  ('Snow Peas', null, 'vegetable', 65, 'Export horticulture crop'),
  ('Napier Grass', 'Bana', 'fodder', null, 'Primary dairy fodder in Kenya'),
  ('Rhodes Grass', null, 'fodder', null, 'Hay production grass'),
  ('Roses', 'Red Calypso', 'flower', null, 'Kenya is a major flower exporter'),
  ('Pyrethrum', null, 'cash_crop', 180, 'Natural insecticide crop'),
  ('Sorghum', 'Gadam', 'grain', 90, 'Drought-tolerant grain crop'),
  ('Millet', 'Finger Millet', 'grain', 100, 'Traditional grain crop'),
  ('Cowpeas', null, 'legume', 75, 'Drought-tolerant legume'),
  ('Green Grams', 'N26', 'legume', 65, 'Ndengu - popular pulse'),
  ('Pigeon Peas', null, 'legume', 150, 'Common in eastern Kenya'),
  ('Chillies', 'African Bird Eye', 'herb', 90, 'Pilipili hoho'),
  ('Coriander', 'Dhania', 'herb', 45, 'Essential Kenyan herb'),
  ('Passion Fruit', 'Purple', 'fruit', null, 'Popular juice fruit')
on conflict do nothing;

-- ============================================================
-- LIVESTOCK TYPES (Kenyan breeds)
-- ============================================================
insert into livestock_types (name, breed, category, description) values
  ('Dairy Cattle', 'Friesian', 'dairy', 'Holstein-Friesian - top milk producer in Kenya'),
  ('Dairy Cattle', 'Ayrshire', 'dairy', 'Hardy dairy breed, good for highlands'),
  ('Dairy Cattle', 'Jersey', 'dairy', 'High butterfat content milk'),
  ('Dairy Cattle', 'Guernsey', 'dairy', 'Good for small-scale dairy'),
  ('Beef Cattle', 'Boran', 'beef', 'Indigenous breed, heat-tolerant'),
  ('Beef Cattle', 'Sahiwal', 'beef', 'Good for arid/semi-arid areas'),
  ('Beef Cattle', 'Ankole', 'beef', 'Long-horned indigenous breed'),
  ('Dairy Goats', 'Toggenburg', 'dairy', 'Popular dairy goat in Kenya'),
  ('Dairy Goats', 'Alpine', 'dairy', 'French Alpine dairy goat'),
  ('Dairy Goats', 'Saanen', 'dairy', 'Highest milk-producing goat breed'),
  ('Meat Goats', 'Galla', 'meat', 'Indigenous goat for meat'),
  ('Meat Goats', 'Small East African', 'meat', 'Hardy indigenous goat'),
  ('Sheep', 'Dorper', 'meat', 'Most popular meat sheep in Kenya'),
  ('Sheep', 'Red Maasai', 'meat', 'Indigenous fat-tailed sheep'),
  ('Layers', 'Kuroiler', 'layers', 'Dual-purpose improved chicken'),
  ('Layers', 'ISA Brown', 'layers', 'Commercial layer chicken'),
  ('Broilers', 'Cobb 500', 'broilers', 'Fast-growing meat chicken'),
  ('Kienyeji Chicken', 'Improved Kienyeji', 'indigenous', 'Local improved free-range chicken'),
  ('Kienyeji Chicken', 'Rainbow Rooster', 'indigenous', 'Colour-sexable indigenous breed'),
  ('Pigs', 'Large White', 'meat', 'Common pig breed in Kenya'),
  ('Pigs', 'Landrace', 'meat', 'Good for bacon production'),
  ('Rabbits', 'New Zealand White', 'meat', 'Popular rabbit breed'),
  ('Rabbits', 'Californian', 'meat', 'Meat and fur production'),
  ('Tilapia', 'Nile Tilapia', 'aquaculture', 'Most farmed fish in Kenya'),
  ('Catfish', 'African Catfish', 'aquaculture', 'Second most farmed fish'),
  ('Bees', 'African Bee', 'apiculture', 'Kenyan bee for honey production'),
  ('Ducks', 'Muscovy', 'dual_purpose', 'Dual-purpose domestic duck'),
  ('Turkeys', 'Bronze Turkey', 'meat', 'Common turkey breed'),
  ('Camels', 'Somali Camel', 'dairy', 'Camel milk production in northern Kenya'),
  ('Donkeys', 'Kenyan Donkey', 'dual_purpose', 'Transport and draft animal')
on conflict do nothing;

-- ============================================================
-- INVENTORY CATEGORIES
-- ============================================================
insert into inventory_categories (name, description) values
  ('Seeds', 'Planting seeds and seedlings'),
  ('Fertilizer', 'Chemical and organic fertilizers'),
  ('Pesticides', 'Insecticides, fungicides, and pest control'),
  ('Herbicides', 'Weed control chemicals'),
  ('Animal Feed', 'Livestock feed and supplements'),
  ('Veterinary Medicine', 'Animal health products and vaccines'),
  ('Equipment', 'Farm tools, machinery, and implements'),
  ('Fuel', 'Diesel, petrol, and lubricants'),
  ('Packaging', 'Bags, crates, and packaging materials'),
  ('Tools', 'Hand tools and small equipment'),
  ('Irrigation Supplies', 'Pipes, drip lines, sprinklers'),
  ('Safety Gear', 'PPE, boots, gloves, overalls')
on conflict do nothing;
