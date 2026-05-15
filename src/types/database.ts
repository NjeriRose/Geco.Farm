export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: 'admin' | 'manager' | 'worker' | 'farmer';
  avatar_url: string | null;
  county: string | null;
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  owner_id: string;
  name: string;
  county: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  size_acres: number;
  farm_type: 'crop' | 'livestock' | 'mixed' | 'aquaculture';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmMember {
  id: string;
  farm_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'worker';
  created_at: string;
  profile?: Profile;
}

export interface Field {
  id: string;
  farm_id: string;
  name: string;
  size_acres: number;
  soil_type: string | null;
  irrigation_type: 'rainfed' | 'drip' | 'sprinkler' | 'furrow' | 'flood' | 'none';
  status: 'active' | 'fallow' | 'preparation';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CropType {
  id: string;
  name: string;
  variety: string | null;
  category: 'grain' | 'vegetable' | 'fruit' | 'cash_crop' | 'legume' | 'tuber' | 'herb' | 'flower' | 'fodder';
  growing_season_days: number | null;
  description: string | null;
  created_at: string;
}

export interface Planting {
  id: string;
  farm_id: string;
  field_id: string;
  crop_type_id: string;
  season: 'long_rains' | 'short_rains' | 'irrigated' | 'year_round' | null;
  planting_date: string;
  expected_harvest_date: string | null;
  actual_harvest_date: string | null;
  area_acres: number;
  seed_quantity: number | null;
  seed_unit: string | null;
  seed_cost_kes: number;
  status: 'planned' | 'planted' | 'growing' | 'harvested' | 'failed';
  notes: string | null;
  created_at: string;
  updated_at: string;
  crop_type?: CropType;
  field?: Field;
}

export interface Harvest {
  id: string;
  planting_id: string;
  farm_id: string;
  harvest_date: string;
  quantity: number;
  unit: string;
  quality_grade: 'A' | 'B' | 'C' | 'reject' | null;
  storage_location: string | null;
  notes: string | null;
  created_at: string;
  planting?: Planting;
}

export interface LivestockType {
  id: string;
  name: string;
  breed: string | null;
  category: 'dairy' | 'beef' | 'meat' | 'layers' | 'broilers' | 'indigenous' | 'dual_purpose' | 'aquaculture' | 'apiculture';
  description: string | null;
  created_at: string;
}

export interface Livestock {
  id: string;
  farm_id: string;
  livestock_type_id: string;
  tag_number: string | null;
  name: string | null;
  date_of_birth: string | null;
  date_acquired: string | null;
  acquisition_cost_kes: number;
  gender: 'male' | 'female' | null;
  status: 'active' | 'sold' | 'deceased' | 'transferred' | 'slaughtered';
  health_status: 'healthy' | 'sick' | 'recovering' | 'quarantine' | 'pregnant';
  weight_kg: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  livestock_type?: LivestockType;
}

export interface LivestockHealthRecord {
  id: string;
  livestock_id: string;
  farm_id: string;
  record_date: string;
  record_type: 'vaccination' | 'treatment' | 'checkup' | 'deworming' | 'artificial_insemination' | 'pregnancy_check';
  description: string;
  medicine: string | null;
  dosage: string | null;
  veterinarian: string | null;
  cost_kes: number;
  next_due_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProductionRecord {
  id: string;
  farm_id: string;
  livestock_id: string | null;
  production_date: string;
  product_type: 'milk' | 'eggs' | 'wool' | 'honey' | 'manure' | 'other';
  quantity: number;
  unit: string;
  quality_grade: string | null;
  notes: string | null;
  created_at: string;
  livestock?: Livestock;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  farm_id: string;
  category_id: string;
  name: string;
  quantity: number;
  unit: string;
  unit_cost_kes: number;
  reorder_level: number;
  supplier: string | null;
  storage_location: string | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category?: InventoryCategory;
}

export interface InventoryTransaction {
  id: string;
  inventory_id: string;
  farm_id: string;
  transaction_type: 'purchase' | 'usage' | 'adjustment' | 'return' | 'write_off';
  quantity: number;
  unit_cost_kes: number;
  total_cost_kes: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  farm_id: string;
  category: 'labor' | 'seeds' | 'fertilizer' | 'pesticide' | 'veterinary' | 'feed' | 'equipment' | 'transport' | 'utilities' | 'rent' | 'fuel' | 'maintenance' | 'other';
  description: string;
  amount_kes: number;
  payment_method: 'cash' | 'mpesa' | 'bank_transfer' | 'cheque' | 'credit';
  reference_number: string | null;
  expense_date: string;
  recorded_by: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Sale {
  id: string;
  farm_id: string;
  item_type: 'crop' | 'livestock' | 'produce' | 'product' | 'other';
  item_description: string;
  quantity: number | null;
  unit: string | null;
  unit_price_kes: number | null;
  total_amount_kes: number;
  buyer_name: string | null;
  buyer_phone: string | null;
  payment_method: 'cash' | 'mpesa' | 'bank_transfer' | 'cheque' | 'credit';
  payment_status: 'paid' | 'pending' | 'partial' | 'overdue';
  reference_number: string | null;
  sale_date: string;
  recorded_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  farm_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  category: 'planting' | 'harvesting' | 'irrigation' | 'spraying' | 'feeding' | 'milking' | 'veterinary' | 'maintenance' | 'transport' | 'general';
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Profile;
}

export interface ActivityLog {
  id: string;
  farm_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  user?: Profile;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeCrops: number;
  totalLivestock: number;
  pendingTasks: number;
  lowStockItems: number;
  recentActivities: ActivityLog[];
}
