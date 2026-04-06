import axios from 'axios';
import { API_BASE_URL } from '../config';
import { ConsultationCatalogData, EsteticaItem, PetCatalogItem, SpeciesCatalogItem, User } from '../types';

type InventoryApiItem = {
  id: number;
  name: string;
  category: string;
  presentation?: string | null;
  sale_unit?: string | null;
  target_species?: string | null;
  stock: number;
  unit_price: number;
  min_stock: number;
  is_active: boolean;
  updated_at?: string;
};

type SaleApiItem = {
  id: number;
  inventory_item_id?: number | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  customer_name?: string | null;
  sold_at: string;
  updated_at?: string;
};

type ConsultationApiItem = {
  id: number;
  pet_id?: number | null;
  species_id?: number | null;
  pet_name: string;
  species: string;
  owner_name: string;
  diagnosis: string;
  treatment?: string | null;
  cost: number;
  consulted_at: string;
  vaccination_applied?: boolean;
  vaccination_note?: string | null;
  next_vaccination_at?: string | null;
  deworming_applied?: boolean;
  deworming_note?: string | null;
  next_deworming_at?: string | null;
  petCatalog?: {
    breed?: string | null;
    size_category?: string | null;
  } | null;
  images?: Array<{ id: number; image_path: string }>;
  updated_at?: string;
};

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function buildFileUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export async function login(email: string, password: string, sede: string) {
  const response = await client.post<{ token: string; user: User }>('/login', {
    email,
    password,
    device_name: `emi-mobile-${sede}`,
  });

  return response.data;
}

export async function me(token: string) {
  const response = await client.get<{ user: User }>('/me', {
    headers: authHeader(token),
  });

  return response.data.user;
}

export async function logout(token: string) {
  await client.post('/logout', {}, { headers: authHeader(token) });
}

export async function fetchConsultationCatalogs(token: string): Promise<ConsultationCatalogData> {
  const response = await client.get<{
    data: {
      species: SpeciesCatalogItem[];
      pets: PetCatalogItem[];
      pricing_rules: Array<{ species_id: number; diagnosis: string; default_cost: number }>;
    };
  }>('/catalogs/consultations-data', {
    headers: authHeader(token),
  });

  return response.data.data;
}

export async function fetchInventory(token: string) {
  const response = await client.get<{ data: InventoryApiItem[] }>('/inventory-items', {
    headers: authHeader(token),
  });

  return response.data.data;
}

export async function fetchSales(token: string) {
  const response = await client.get<{ data: SaleApiItem[] }>('/sales', {
    headers: authHeader(token),
  });

  return response.data.data;
}

export async function fetchConsultations(token: string) {
  const response = await client.get<{ data: ConsultationApiItem[] }>('/consultations', {
    headers: authHeader(token),
  });

  return response.data.data;
}

export async function fetchEsteticaServices(token: string) {
  const response = await client.get<{ data: EsteticaItem[] }>('/estetica-services', {
    headers: authHeader(token),
  });

  return response.data.data;
}

export async function createInventory(token: string, payload: Record<string, unknown>) {
  const response = await client.post<{ data: { id: number } }>('/inventory-items', payload, {
    headers: authHeader(token),
  });

  return response.data.data.id;
}

export async function createSale(token: string, payload: Record<string, unknown>) {
  const response = await client.post<{ data: { id: number } }>('/sales', payload, {
    headers: authHeader(token),
  });

  return response.data.data.id;
}

export async function createConsultation(token: string, payload: Record<string, unknown>) {
  const response = await client.post<{ data: { id: number } }>('/consultations', payload, {
    headers: {
      ...authHeader(token),
      'Content-Type': 'application/json',
    },
  });

  return response.data.data.id;
}

export async function createEsteticaService(token: string, payload: Record<string, unknown>) {
  const response = await client.post<{ data: { id: number } }>('/estetica-services', payload, {
    headers: {
      ...authHeader(token),
      'Content-Type': 'application/json',
    },
  });

  return response.data.data.id;
}
