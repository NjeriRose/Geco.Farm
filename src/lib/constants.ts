export const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River',
  'Tharaka Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot',
] as const;

export const FARM_TYPES = [
  { value: 'crop', label: 'Crop Farming' },
  { value: 'livestock', label: 'Livestock Farming' },
  { value: 'mixed', label: 'Mixed Farming' },
  { value: 'aquaculture', label: 'Aquaculture' },
] as const;

export const CROP_CATEGORIES = [
  { value: 'grain', label: 'Grains & Cereals' },
  { value: 'vegetable', label: 'Vegetables' },
  { value: 'fruit', label: 'Fruits' },
  { value: 'cash_crop', label: 'Cash Crops' },
  { value: 'legume', label: 'Legumes' },
  { value: 'tuber', label: 'Tubers & Roots' },
  { value: 'herb', label: 'Herbs & Spices' },
  { value: 'flower', label: 'Flowers' },
  { value: 'fodder', label: 'Fodder & Pasture' },
] as const;

export const SEASONS = [
  { value: 'long_rains', label: 'Long Rains (Mar–May)' },
  { value: 'short_rains', label: 'Short Rains (Oct–Dec)' },
  { value: 'irrigated', label: 'Irrigated' },
  { value: 'year_round', label: 'Year Round' },
] as const;

export const PLANTING_STATUSES = [
  { value: 'planned', label: 'Planned', color: 'bg-blue-100 text-blue-800' },
  { value: 'planted', label: 'Planted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'growing', label: 'Growing', color: 'bg-green-100 text-green-800' },
  { value: 'harvested', label: 'Harvested', color: 'bg-purple-100 text-purple-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
] as const;

export const LIVESTOCK_CATEGORIES = [
  { value: 'dairy', label: 'Dairy' },
  { value: 'beef', label: 'Beef' },
  { value: 'meat', label: 'Meat' },
  { value: 'layers', label: 'Layers' },
  { value: 'broilers', label: 'Broilers' },
  { value: 'indigenous', label: 'Indigenous/Kienyeji' },
  { value: 'dual_purpose', label: 'Dual Purpose' },
  { value: 'aquaculture', label: 'Aquaculture' },
  { value: 'apiculture', label: 'Apiculture (Bees)' },
] as const;

export const HEALTH_RECORD_TYPES = [
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'checkup', label: 'Checkup' },
  { value: 'deworming', label: 'Deworming' },
  { value: 'artificial_insemination', label: 'Artificial Insemination (AI)' },
  { value: 'pregnancy_check', label: 'Pregnancy Check' },
] as const;

export const PRODUCTION_TYPES = [
  { value: 'milk', label: 'Milk', unit: 'litres' },
  { value: 'eggs', label: 'Eggs', unit: 'pieces' },
  { value: 'wool', label: 'Wool', unit: 'kg' },
  { value: 'honey', label: 'Honey', unit: 'kg' },
  { value: 'manure', label: 'Manure', unit: 'kg' },
  { value: 'other', label: 'Other', unit: 'units' },
] as const;

export const EXPENSE_CATEGORIES = [
  { value: 'labor', label: 'Labour' },
  { value: 'seeds', label: 'Seeds & Seedlings' },
  { value: 'fertilizer', label: 'Fertilizer' },
  { value: 'pesticide', label: 'Pesticides & Chemicals' },
  { value: 'veterinary', label: 'Veterinary Services' },
  { value: 'feed', label: 'Animal Feed' },
  { value: 'equipment', label: 'Equipment & Machinery' },
  { value: 'transport', label: 'Transport' },
  { value: 'utilities', label: 'Utilities (Water, Power)' },
  { value: 'rent', label: 'Rent & Lease' },
  { value: 'fuel', label: 'Fuel & Energy' },
  { value: 'maintenance', label: 'Maintenance & Repairs' },
  { value: 'other', label: 'Other' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'credit', label: 'Credit/On Account' },
] as const;

export const PAYMENT_STATUSES = [
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'partial', label: 'Partial', color: 'bg-blue-100 text-blue-800' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
] as const;

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
] as const;

export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-slate-100 text-slate-800' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
] as const;

export const TASK_CATEGORIES = [
  { value: 'planting', label: 'Planting' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'spraying', label: 'Spraying' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'milking', label: 'Milking' },
  { value: 'veterinary', label: 'Veterinary' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'transport', label: 'Transport' },
  { value: 'general', label: 'General' },
] as const;

export const SOIL_TYPES = [
  'Clay', 'Loam', 'Sandy', 'Silt', 'Volcanic', 'Red Soil', 'Black Cotton',
] as const;

export const IRRIGATION_TYPES = [
  { value: 'rainfed', label: 'Rain-fed' },
  { value: 'drip', label: 'Drip Irrigation' },
  { value: 'sprinkler', label: 'Sprinkler' },
  { value: 'furrow', label: 'Furrow' },
  { value: 'flood', label: 'Flood' },
  { value: 'none', label: 'None' },
] as const;

export const QUALITY_GRADES = [
  { value: 'A', label: 'Grade A (Premium)' },
  { value: 'B', label: 'Grade B (Standard)' },
  { value: 'C', label: 'Grade C (Below Standard)' },
  { value: 'reject', label: 'Reject' },
] as const;

export const INVENTORY_CATEGORY_NAMES = [
  'Seeds', 'Fertilizer', 'Pesticides', 'Herbicides', 'Animal Feed',
  'Veterinary Medicine', 'Equipment', 'Fuel', 'Packaging', 'Tools',
] as const;

export const LIVESTOCK_HEALTH_STATUSES = [
  { value: 'healthy', label: 'Healthy', color: 'bg-green-100 text-green-800' },
  { value: 'sick', label: 'Sick', color: 'bg-red-100 text-red-800' },
  { value: 'recovering', label: 'Recovering', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'quarantine', label: 'Quarantine', color: 'bg-orange-100 text-orange-800' },
  { value: 'pregnant', label: 'Pregnant', color: 'bg-purple-100 text-purple-800' },
] as const;

export const LIVESTOCK_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'sold', label: 'Sold', color: 'bg-blue-100 text-blue-800' },
  { value: 'deceased', label: 'Deceased', color: 'bg-slate-100 text-slate-800' },
  { value: 'transferred', label: 'Transferred', color: 'bg-purple-100 text-purple-800' },
  { value: 'slaughtered', label: 'Slaughtered', color: 'bg-orange-100 text-orange-800' },
] as const;
