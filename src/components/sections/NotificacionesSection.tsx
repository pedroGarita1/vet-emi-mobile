import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Notificacion } from '../../types';

interface NotificacionesScreenProps {
  notificaciones: Notificacion[];
  cargando: boolean;
  conexion: boolean;
  onSeleccionar?: (notificacion: Notificacion) => void;
}

export function NotificacionesScreen({
  notificaciones,
  cargando,
  conexion,
  onSeleccionar,
}: NotificacionesScreenProps) {
  const obtenerColorPorTipo = (tipo: string): string => {
    switch (tipo) {
      case 'promocion':
        return '#10b981';
      case 'cierre':
        return '#ef4444';
      case 'aviso':
        return '#f59e0b';
      default:
        return '#6366f1';
    }
  };

  const obtenerIconoPorTipo = (tipo: string): string => {
    switch (tipo) {
      case 'promocion':
        return '🎉';
      case 'cierre':
        return '⏰';
      case 'aviso':
        return '📢';
      default:
        return '📬';
    }
  };

  const renderNotificacion = ({ item }: { item: Notificacion }) => (
    <Pressable
      onPress={() => onSeleccionar?.(item)}
      style={({ pressed }) => [
        styles.notificacionCard,
        {
          backgroundColor: pressed ? '#f9fafb' : '#ffffff',
          borderLeftColor: obtenerColorPorTipo(item.tipo),
        },
      ]}
    >
      <View style={styles.notificacionHeader}>
        <Text style={styles.iconoTipo}>{obtenerIconoPorTipo(item.tipo)}</Text>
        <View style={styles.notificacionInfo}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.tipo}>{item.tipoFormato?.nombre || item.tipo}</Text>
        </View>
      </View>
      <Text style={styles.descripcion} numberOfLines={2}>
        {item.descripcion}
      </Text>
      <Text style={styles.fecha}>
        🕐 {new Date(item.fecha_inicio).toLocaleDateString('es-ES')}
      </Text>
    </Pressable>
  );

  if (!conexion) {
    return (
      <View style={styles.contenedor}>
        <View style={styles.sinConexion}>
          <Text style={styles.titulo}>📶 Sin conexión a internet</Text>
          <Text style={styles.descripcion}>
            Los avisos se sincronizan solo cuando hay conexión disponible.
          </Text>
        </View>
      </View>
    );
  }

  if (cargando) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>⏳ Cargando avisos...</Text>
      </View>
    );
  }

  if (notificaciones.length === 0) {
    return (
      <View style={styles.contenedor}>
        <View style={styles.vacio}>
          <Text style={styles.titulo}>📬 Sin avisos nuevos</Text>
          <Text style={styles.descripcion}>
            No hay notificaciones en este momento.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={notificaciones}
      renderItem={renderNotificacion}
      keyExtractor={(item) => `notificacion-${item.id}`}
      contentContainerStyle={styles.listContainer}
      scrollEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f7fa',
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  notificacionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  notificacionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconoTipo: {
    fontSize: 24,
    marginRight: 10,
  },
  notificacionInfo: {
    flex: 1,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  tipo: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  descripcion: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 10,
    lineHeight: 20,
  },
  fecha: {
    fontSize: 12,
    color: '#9ca3af',
  },
  sinConexion: {
    alignItems: 'center',
    padding: 20,
  },
  vacio: {
    alignItems: 'center',
    padding: 20,
  },
});
