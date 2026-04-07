import { Platform } from 'react-native';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function resolveApiOrigin() {
  const explicitOrigin = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicitOrigin) {
    return trimTrailingSlash(explicitOrigin);
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000`;
  }

  return 'http://127.0.0.1:8000';
}

export const API_ORIGIN = resolveApiOrigin();
export const API_BASE_URL = `${API_ORIGIN}/api`;

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
