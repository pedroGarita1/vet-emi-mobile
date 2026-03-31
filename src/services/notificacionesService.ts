import { Notificacion } from '../types';
import * as Network from 'expo-network';

/**
 * Obtener notificaciones activas desde el servidor
 * Solo funcionará si hay conexión a internet
 */
export async function obtenerNotificacionesActivas(): Promise<Notificacion[]> {
  try {
    // Verificar conexión a internet
    const isConnected = await verificarConexionInternet();
    if (!isConnected) {
      console.warn('Sin conexión a internet. No se pueden obtener las notificaciones.');
      return [];
    }

    const controlador = new AbortController();
    const idTimeout = setTimeout(() => controlador.abort(), 10000);

    const respuesta = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/notificaciones`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controlador.signal,
      }
    );
    
    clearTimeout(idTimeout);

    if (!respuesta.ok) {
      console.error(`Error al obtener notificaciones: ${respuesta.status}`);
      return [];
    }

    const datos = await respuesta.json();

    if (datos.success && Array.isArray(datos.datos)) {
      return datos.datos;
    }

    return [];
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }
}

/**
 * Obtener una notificación específica por ID
 */
export async function obtenerNotificacion(notificacionId: number): Promise<Notificacion | null> {
  try {
    // Verificar conexión a internet
    const isConnected = await verificarConexionInternet();
    if (!isConnected) {
      console.warn('Sin conexión a internet. No se puede obtener la notificación.');
      return null;
    }

    const controlador = new AbortController();
    const idTimeout = setTimeout(() => controlador.abort(), 10000);

    const respuesta = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/notificaciones/${notificacionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controlador.signal,
      }
    );

    clearTimeout(idTimeout);

    if (!respuesta.ok) {
      console.error(`Error al obtener notificación: ${respuesta.status}`);
      return null;
    }

    const datos = await respuesta.json();

    if (datos.success) {
      return datos.datos;
    }

    return null;
  } catch (error) {
    console.error('Error al obtener la notificación:', error);
    return null;
  }
}

/**
 * Verificar si hay conexión a internet
 */
export async function verificarConexionInternet(): Promise<boolean> {
  try {
    const estado = await Network.getNetworkStateAsync();
    const estaConectado = estado.isConnected ?? false;
    const tieneInternet = estado.isInternetReachable ?? true;
    return estaConectado && tieneInternet;
  } catch (error) {
    console.error('Error al verificar conexión:', error);
    return false;
  }
}

/**
 * Obtener el tipo de conexión disponible
 */
export async function obtenerTipoConexion(): Promise<string> {
  try {
    const estado = await Network.getNetworkStateAsync();
    return estado.type || 'unknown';
  } catch (error) {
    console.error('Error al obtener tipo de conexión:', error);
    return 'unknown';
  }
}

/**
 * Filtrar notificaciones por tipo
 */
export function filtrarNotificacionesPorTipo(
  notificaciones: Notificacion[],
  tipo: 'promocion' | 'cierre' | 'aviso' | 'otro'
): Notificacion[] {
  return notificaciones.filter((n) => n.tipo === tipo);
}

/**
 * Ordenar notificaciones por fecha (más recientes primero)
 */
export function ordenarNotificacionesPorFecha(notificaciones: Notificacion[]): Notificacion[] {
  return [...notificaciones].sort((a, b) => {
    return new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime();
  });
}

/**
 * Obtener notificaciones vigentes (dentro de su rango de fechas)
 */
export function obtenerNotificacionesVigentes(notificaciones: Notificacion[]): Notificacion[] {
  const ahora = new Date();
  return notificaciones.filter((n) => {
    const inicio = new Date(n.fecha_inicio);
    const fin = n.fecha_fin ? new Date(n.fecha_fin) : null;
    return inicio <= ahora && (!fin || fin >= ahora);
  });
}
