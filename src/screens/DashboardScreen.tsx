import { useRef, useState } from 'react';
import { Animated, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { ConsultationCatalogData, ConsultationFormValues, ConsultationItem, EsteticaFormValues, EsteticaItem, InventoryFormValues, InventoryItem, SaleFormValues, SaleItem, Section, User } from '../types';
import { palette, ui } from '../styles/theme';
import { AppButton } from '../components/ui/AppButton';
import { InventorySection } from '../components/sections/InventorySection';
import { SalesSection } from '../components/sections/SalesSection';
import { ConsultationsSection } from '../components/sections/ConsultationsSection';
import { SideDrawer } from '../components/ui/SideDrawer';
import { HomeSection } from '../components/sections/HomeSection';
import { EsteticaSection } from '../components/sections/EsteticaSection';

const DRAWER_WIDTH = 290;

type Props = {
  user: User;
  sede: string;
  syncing: boolean;
  activeSection: Section;
  inventory: InventoryItem[];
  sales: SaleItem[];
  consultations: ConsultationItem[];
  esteticaServices: EsteticaItem[];
  consultationCatalogs: ConsultationCatalogData;
  onLogout: () => void;
  onSync: () => void;
  onChangeSection: (value: Section) => void;
  onCreateInventory: (payload: InventoryFormValues) => Promise<void>;
  onCreateSale: (payload: SaleFormValues) => Promise<void>;
  onCreateConsultation: (payload: ConsultationFormValues) => Promise<void>;
  onCreateEstetica: (payload: EsteticaFormValues) => Promise<void>;
};

export function DashboardScreen({
  user,
  sede,
  syncing,
  activeSection,
  inventory,
  sales,
  consultations,
  esteticaServices,
  consultationCatalogs,
  onLogout,
  onSync,
  onChangeSection,
  onCreateInventory,
  onCreateSale,
  onCreateConsultation,
  onCreateEstetica,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  const pendingCount =
    inventory.filter((x) => x.sync_status === 'pending').length +
    sales.filter((x) => x.sync_status === 'pending').length +
    consultations.filter((x) => x.sync_status === 'pending').length +
    esteticaServices.filter((x) => x.sync_status === 'pending').length;

  const sectionTitle =
    activeSection === 'home'
      ? 'Inicio'
      : activeSection === 'inventory'
        ? 'Inventario'
        : activeSection === 'sales'
          ? 'Punto de Venta'
          : activeSection === 'consultations'
            ? 'Consultas'
            : 'Estetica';

  const sectionDescription =
    activeSection === 'home'
      ? 'Resumen operativo: consultas recientes y ultimas ventas.'
      : activeSection === 'inventory'
        ? 'Gestion y captura de productos en inventario.'
        : activeSection === 'sales'
          ? 'Registro de ventas y visualizacion del historial.'
          : activeSection === 'consultations'
            ? 'Captura completa de consultas y tratamientos.'
            : 'Servicios de estetica con autollenado de datos del dueño.';

  return (
    <SafeAreaView style={ui.safeArea}>
      <ScrollView contentContainerStyle={ui.screenPadding}>
        <View
          style={{
            backgroundColor: palette.primaryDark,
            borderRadius: 18,
            paddingVertical: 24,
            paddingHorizontal: 20,
            gap: 10,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.16)',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text style={{ color: '#ece6fb', fontWeight: '700' }}>Emi Veterinaria</Text>
            {/* <Text style={{ color: '#ece6fb', fontWeight: '700', fontSize: 12 }}>Menu flotante activo</Text> */}
          </View>

          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Panel de campo</Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: -4, fontSize: 14, fontWeight: '500' }}>
            Modulos separados por apartado desde el menu lateral.
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <AppButton
              label={syncing ? 'Sincronizando...' : `Sincronizar (${pendingCount})`}
              onPress={onSync}
              loading={syncing}
              style={{ flex: 1, backgroundColor: '#8b78b9' }}
            />
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <View
            style={{
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#dcebe6',
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 14,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 19, fontWeight: '800', color: palette.text }}>{sectionTitle}</Text>
            <Text style={{ color: palette.muted, fontWeight: '600', marginTop: 2, fontSize: 13 }}>{sectionDescription}</Text>
          </View>

          {activeSection === 'home' ? <HomeSection consultations={consultations} sales={sales} /> : null}

          {activeSection === 'inventory' ? (
            <InventorySection items={inventory} loading={syncing} onCreate={onCreateInventory} />
          ) : null}

          {activeSection === 'sales' ? (
            <SalesSection inventory={inventory} sales={sales} loading={syncing} onCreate={onCreateSale} />
          ) : null}

          {activeSection === 'consultations' ? (
            <ConsultationsSection
              consultations={consultations}
              inventory={inventory}
              petsCatalog={consultationCatalogs.pets}
              speciesCatalog={consultationCatalogs.species}
              pricingRules={consultationCatalogs.pricing_rules}
              loading={syncing}
              onCreate={onCreateConsultation}
            />
          ) : null}

          {activeSection === 'estetica' ? (
            <EsteticaSection
              services={esteticaServices}
              petsCatalog={consultationCatalogs.pets}
              loading={syncing}
              onCreate={onCreateEstetica}
            />
          ) : null}
        </View>
      </ScrollView>

      <Pressable
        onPress={openDrawer}
        style={{
          position: 'absolute',
          left: 18,
          top: 26,
          zIndex: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#7d68ac',
          borderRadius: 999,
          borderWidth: 2,
          borderColor: '#e7ddf6',
          paddingHorizontal: 14,
          paddingVertical: 10,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 9,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>|||</Text>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Menu</Text>
      </Pressable>

      <SideDrawer
        visible={drawerOpen}
        userName={user.name}
        activeSection={activeSection}
        drawerAnim={drawerAnim}
        onClose={closeDrawer}
        onSelectSection={onChangeSection}
        onSync={onSync}
        onLogout={onLogout}
      />
    </SafeAreaView>
  );
}
