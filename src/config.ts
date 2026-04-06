import { Platform } from 'react-native';

export const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8001/api' : 'http://127.0.0.1:8001/api';

export const DEFAULT_EMAIL = 'demo@emi.com';
export const DEFAULT_PASSWORD = 'EmiVet123*';

export const SEDES = ['Matriz', 'Sucursal Norte', 'Sucursal Sur'] as const;

export const SPECIES_OPTIONS = [
  'Canino',
  'Felino',
  'Aviar',
  'Roedor',
  'Equino',
  'Bovino',
] as const;

export const SALE_UNITS = [
  'unidad',
  'pieza',
  'paquete',
  'bulto',
  'sobre',
  'frasco',
  'caja',
  'tableta',
  'kg',
  'g',
  'litro',
  'ml',
] as const;
