export type Section = 'home' | 'inventory' | 'sales' | 'consultations' | 'estetica';
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

export type TipoNotificacion = 'promocion' | 'cierre' | 'aviso' | 'otro';

export type Notificacion = {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: TipoNotificacion;
  tipoFormato?: {
    icono: string;
    nombre: string;
    color: string;
  };
  fecha_inicio: string;
  fecha_fin: string | null;
};

export type PetCatalogItem = {
  id: number;
  name: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  breed: string;
  size_category: string;
  species_id: number | null;
};

export type SpeciesCatalogItem = {
  id: number;
  name: string;
};

export type PricingRuleItem = {
  species_id: number;
  diagnosis: string;
  default_cost: number;
};

export type ConsultationCatalogData = {
  pets: PetCatalogItem[];
  species: SpeciesCatalogItem[];
  pricing_rules: PricingRuleItem[];
};

export type MediaItem = {
  id?: number;
  image_path: string;
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
  pet_id: number | null;
  species_id: number | null;
  pet_name: string;
  species: string;
  owner_name: string;
  pet_breed: string;
  pet_size: string;
  diagnosis: string;
  treatment: string;
  cost: number;
  consulted_at: string;
  vaccination_applied: boolean;
  vaccination_note: string;
  next_vaccination_at: string;
  deworming_applied: boolean;
  deworming_note: string;
  next_deworming_at: string;
  medications_json: string;
  images_json: string;
  sync_status: SyncStatus;
  updated_at: string;
};

export type EsteticaItem = {
  local_id: string;
  remote_id: number | null;
  pet_id: number | null;
  pet_name: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  service_type: string;
  status: 'pendiente' | 'en_proceso' | 'lista' | 'entregada';
  notes: string;
  requested_at: string;
  ready_at: string;
  notified_at: string;
  images_json: string;
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

export type EsteticaFormValues = Omit<
  EsteticaItem,
  'local_id' | 'remote_id' | 'sync_status' | 'updated_at' | 'ready_at' | 'notified_at'
>;
