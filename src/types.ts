export type Section = 'home' | 'inventory' | 'sales' | 'consultations';
export type SyncStatus = 'pending' | 'synced';

export type User = {
  id: number;
  name: string;
  email: string;
};

export type SessionState = {
  token: string;
  sede: string;
  user: User;
};

export type InventoryItem = {
  local_id: string;
  remote_id: number | null;
  name: string;
  category: string;
  presentation: string;
  sale_unit: string;
  target_species: string;
  stock: number;
  unit_price: number;
  min_stock: number;
  is_active: boolean;
  sync_status: SyncStatus;
  updated_at: string;
};

export type SaleItem = {
  local_id: string;
  remote_id: number | null;
  inventory_item_id: number | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  customer_name: string;
  sold_at: string;
  species_filter: string;
  sync_status: SyncStatus;
  updated_at: string;
};

export type MedicationLine = {
  id: string;
  inventory_label: string;
  quantity: string;
  unit_price: string;
  dosage: string;
  frequency_hours: string;
  duration_days: string;
  notes: string;
};

export type ConsultationItem = {
  local_id: string;
  remote_id: number | null;
  pet_name: string;
  species: string;
  owner_name: string;
  pet_breed: string;
  pet_size: string;
  diagnosis: string;
  treatment: string;
  cost: number;
  consulted_at: string;
  medications_json: string;
  sync_status: SyncStatus;
  updated_at: string;
};

export type InventoryFormValues = Omit<
  InventoryItem,
  'local_id' | 'remote_id' | 'sync_status' | 'updated_at'
>;

export type SaleFormValues = Omit<
  SaleItem,
  'local_id' | 'remote_id' | 'total' | 'sync_status' | 'updated_at'
>;

export type ConsultationFormValues = Omit<
  ConsultationItem,
  'local_id' | 'remote_id' | 'sync_status' | 'updated_at'
>;
