import { memo } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Section } from '../../types';

type Props = {
  visible: boolean;
  userName: string;
  activeSection: Section;
  drawerAnim: Animated.Value;
  onClose: () => void;
  onSelectSection: (value: Section) => void;
  onSync: () => void;
  onLogout: () => void;
};

const entries: Array<{ key: Section; label: string; icon: string }> = [
  { key: 'home', label: 'Inicio', icon: 'H' },
  { key: 'inventory', label: 'Inventario', icon: 'I' },
  { key: 'sales', label: 'Punto de venta', icon: 'P' },
  { key: 'consultations', label: 'Consultas', icon: 'C' },
];

export const SideDrawer = memo(function SideDrawer({
  visible,
  userName,
  activeSection,
  drawerAnim,
  onClose,
  onSelectSection,
  onSync,
  onLogout,
}: Props) {
  if (!visible) {
    return null;
  }

  return (
    <>
      <Pressable style={styles.overlay} onPress={onClose} />
      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}> 
        <View style={{ flex: 1 }}>
          <View style={styles.hero}>
            <View style={styles.heroTopRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{(userName || 'U').charAt(0).toUpperCase()}</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>X</Text>
              </Pressable>
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userRole}>Inspector de campo</Text>
          </View>

          <View style={styles.navBlock}>
            <Text style={styles.navLabelTitle}>Principal</Text>
            {entries
              .filter((entry) => entry.key === 'home')
              .map((entry) => {
                const selected = activeSection === entry.key;

                return (
                  <Pressable
                    key={entry.key}
                    style={[styles.navItem, selected && styles.navItemActive]}
                    onPress={() => {
                      onSelectSection(entry.key);
                      onClose();
                    }}
                  >
                    <View style={[styles.navIconWrap, selected && styles.navIconWrapActive]}>
                      <Text style={[styles.navIconText, selected && { color: '#fff' }]}>{entry.icon}</Text>
                    </View>
                    <Text style={[styles.navItemLabel, selected && styles.navItemLabelActive]}>{entry.label}</Text>
                  </Pressable>
                );
              })}

            <Text style={[styles.navLabelTitle, { marginTop: 14 }]}>Modulos</Text>
            {entries.map((entry) => {
              if (entry.key === 'home') {
                return null;
              }

              const selected = activeSection === entry.key;

              return (
                <Pressable
                  key={entry.key}
                  style={[styles.navItem, selected && styles.navItemActive]}
                  onPress={() => {
                    onSelectSection(entry.key);
                    onClose();
                  }}
                >
                  <View style={[styles.navIconWrap, selected && styles.navIconWrapActive]}>
                    <Text style={[styles.navIconText, selected && { color: '#fff' }]}>{entry.icon}</Text>
                  </View>
                  <Text style={[styles.navItemLabel, selected && styles.navItemLabelActive]}>{entry.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.actionBtn} onPress={onSync}>
              <Text style={styles.actionBtnText}>Sincronizar ahora</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.logoutBtn]} onPress={onLogout}>
              <Text style={styles.actionBtnText}>Cerrar sesion</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.44)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 290,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 18,
    zIndex: 20,
  },
  hero: {
    backgroundColor: '#5d4a82',
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  closeBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  userName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  userRole: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '500',
  },
  navBlock: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 22,
  },
  navLabelTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8aa0a2',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 8,
    paddingLeft: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 11,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#f1ecfa',
  },
  navIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ddd4ef',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  navIconWrapActive: {
    borderColor: '#5d4a82',
    backgroundColor: '#5d4a82',
  },
  navIconText: {
    color: '#5d4a82',
    fontSize: 13,
    fontWeight: '800',
  },
  navItemLabel: {
    color: '#263a3f',
    fontWeight: '700',
    fontSize: 14,
  },
  navItemLabelActive: {
    color: '#5d4a82',
  },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9e4f3',
  },
  actionBtn: {
    borderRadius: 10,
    backgroundColor: '#7d68ac',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  logoutBtn: {
    backgroundColor: '#4b3c69',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
});
