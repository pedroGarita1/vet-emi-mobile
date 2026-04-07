import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, View } from 'react-native';
import './global.css';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { fetchConsultationCatalogs, login, logout, me } from './src/services/api';
import { refreshRemoteIntoLocal, syncPendingToServer } from './src/services/sync';
import {
  getConsultations,
  getEsteticaServices,
  getInventoryItems,
  getSales,
  initLocalDb,
  savePendingConsultation,
  savePendingEstetica,
  savePendingInventory,
  savePendingSale,
} from './src/storage/localDb';
import { clearSession, loadSession, saveSession } from './src/storage/session';
import { ui } from './src/styles/theme';
import {
  ConsultationCatalogData,
  ConsultationFormValues,
  ConsultationItem,
  EsteticaFormValues,
  EsteticaItem,
  InventoryFormValues,
  InventoryItem,
  SaleFormValues,
  SaleItem,
  Section,
  SessionState,
} from './src/types';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sede, setSede] = useState('Matriz');
  const [session, setSession] = useState<SessionState | null>(null);

  const [booting, setBooting] = useState(true);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('home');

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [esteticaServices, setEsteticaServices] = useState<EsteticaItem[]>([]);
  const [consultationCatalogs, setConsultationCatalogs] = useState<ConsultationCatalogData>({
    pets: [],
    species: [],
    pricing_rules: [],
  });

  const refreshLocalLists = async () => {
    const [localInventory, localSales, localConsultations, localEsteticaServices] = await Promise.all([
      getInventoryItems(),
      getSales(),
      getConsultations(),
      getEsteticaServices(),
    ]);

    setInventory(localInventory);
    setSales(localSales);
    setConsultations(localConsultations);
    setEsteticaServices(localEsteticaServices);
  };

  const syncEverything = async (token: string) => {
    setSyncing(true);

    try {
      await syncPendingToServer(token);
      await refreshRemoteIntoLocal(token);
      const catalogs = await fetchConsultationCatalogs(token);
      setConsultationCatalogs(catalogs);
    } finally {
      await refreshLocalLists();
      setSyncing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await initLocalDb();
        await refreshLocalLists();

        const saved = await loadSession();
        if (!saved) {
          return;
        }

        const profile = await me(saved.token);
        const hydrated: SessionState = { ...saved, user: profile };
        setSession(hydrated);
        await saveSession(hydrated);

        try {
          await syncEverything(saved.token);
        } catch {
          try {
            const catalogs = await fetchConsultationCatalogs(saved.token);
            setConsultationCatalogs(catalogs);
          } catch {
            // Mantiene funcionamiento offline aunque falle catalogo.
          }
          await refreshLocalLists();
        }
      } catch {
        await clearSession();
        setSession(null);
      } finally {
        setBooting(false);
      }
    };

    void init();
  }, []);

  const handleLogin = async () => {
    setBusy(true);
    setError(null);

    try {
      const response = await login(email, password, sede);
      const nextSession: SessionState = {
        token: response.token,
        user: response.user,
        sede,
      };

      setSession(nextSession);
      await saveSession(nextSession);

      try {
        await syncEverything(nextSession.token);
      } catch {
        await refreshLocalLists();
      }
    } catch {
      setError('No se pudo iniciar sesion. Verifica credenciales o conexion.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    if (!session) {
      return;
    }

    setBusy(true);

    try {
      await logout(session.token);
    } catch {
      // Mantiene salida local aunque falle el endpoint remoto.
    } finally {
      await clearSession();
      setSession(null);
      setBusy(false);
    }
  };

  const handleCreateInventory = async (payload: InventoryFormValues) => {
    await savePendingInventory(payload);
    await refreshLocalLists();

    if (!session) {
      return;
    }

    try {
      await syncEverything(session.token);
      Alert.alert('Inventario', 'Producto sincronizado con servidor.');
    } catch {
      Alert.alert('Guardado offline', 'Producto guardado en SQLite. Se sincronizara cuando haya internet.');
    }
  };

  const handleCreateSale = async (payload: SaleFormValues) => {
    await savePendingSale(payload);
    await refreshLocalLists();

    if (!session) {
      return;
    }

    try {
      await syncEverything(session.token);
      Alert.alert('Venta', 'Venta sincronizada con servidor.');
    } catch {
      Alert.alert('Guardado offline', 'Venta guardada en SQLite. Se sincronizara cuando haya internet.');
    }
  };

  const handleCreateConsultation = async (payload: ConsultationFormValues) => {
    await savePendingConsultation(payload);
    await refreshLocalLists();

    if (!session) {
      return;
    }

    try {
      await syncEverything(session.token);
      Alert.alert('Consulta', 'Consulta sincronizada con servidor.');
    } catch {
      Alert.alert('Guardado offline', 'Consulta guardada en SQLite. Se sincronizara cuando haya internet.');
    }
  };

  const handleCreateEstetica = async (payload: EsteticaFormValues) => {
    await savePendingEstetica(payload);
    await refreshLocalLists();

    if (!session) {
      return;
    }

    try {
      await syncEverything(session.token);
      Alert.alert('Estetica', 'Servicio sincronizado con servidor.');
    } catch {
      Alert.alert('Guardado offline', 'Servicio guardado en SQLite. Se sincronizara cuando haya internet.');
    }
  };

  const handleSyncNow = async () => {
    if (!session) {
      return;
    }

    try {
      await syncEverything(session.token);
      Alert.alert('Sincronizacion completa', 'Los datos locales y remotos estan actualizados.');
    } catch {
      Alert.alert('Sin conexion', 'No fue posible sincronizar ahora. Tus formularios siguen guardados offline.');
    }
  };

  if (booting) {
    return (
      <SafeAreaView style={ui.safeArea}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#047857" />
          <Text style={{ marginTop: 12, color: '#475569' }}>Inicializando base local y sesion...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <>
        <StatusBar style="dark" />
        <LoginScreen
          email={email}
          password={password}
          sede={sede}
          loading={busy}
          error={error}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSedeChange={setSede}
          onSubmit={() => void handleLogin()}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <DashboardScreen
        user={session.user}
        sede={session.sede}
        syncing={syncing || busy}
        activeSection={activeSection}
        inventory={inventory}
        sales={sales}
        consultations={consultations}
        esteticaServices={esteticaServices}
        consultationCatalogs={consultationCatalogs}
        onLogout={() => void handleLogout()}
        onSync={() => void handleSyncNow()}
        onChangeSection={setActiveSection}
        onCreateInventory={handleCreateInventory}
        onCreateSale={handleCreateSale}
        onCreateConsultation={handleCreateConsultation}
        onCreateEstetica={handleCreateEstetica}
      />
    </>
  );
}
