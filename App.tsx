import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type User = {
  id: number;
  name: string;
  email: string;
};

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit_price: number;
};

type Sale = {
  id: number;
  product_name: string;
  quantity: number;
  total: number;
  customer_name: string | null;
  sold_at: string;
};

type Consultation = {
  id: number;
  pet_name: string;
  species: string;
  owner_name: string;
  diagnosis: string;
  consulted_at: string;
};

type Section = 'inventory' | 'sales' | 'consultations';

const API_BASE_URL = 'http://10.0.2.2:8000/api';
const TOKEN_KEY = 'emi_api_token';

export default function App() {
  const [email, setEmail] = useState('demo@emi.com');
  const [password, setPassword] = useState('EmiVet123*');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('inventory');

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  const [saleProduct, setSaleProduct] = useState('');
  const [saleQty, setSaleQty] = useState('1');
  const [salePrice, setSalePrice] = useState('0');

  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('Canino');
  const [ownerName, setOwnerName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  const api = useMemo(() => axios.create({ baseURL: API_BASE_URL }), []);

  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (!storedToken) {
          return;
        }

        setToken(storedToken);
        await fetchProfile(storedToken);
      } finally {
        setBooting(false);
      }
    };

    void init();
  }, []);

  const fetchProfile = async (authToken: string) => {
    const response = await api.get<{ user: User }>('/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    setUser(response.data.user);
    await fetchModules(authToken);
  };

  const fetchModules = async (authToken: string) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const [inventoryRes, salesRes, consultationsRes] = await Promise.all([
      api.get<{ data: InventoryItem[] }>('/inventory-items', { headers }),
      api.get<{ data: Sale[] }>('/sales', { headers }),
      api.get<{ data: Consultation[] }>('/consultations', { headers }),
    ]);

    setInventory(inventoryRes.data.data);
    setSales(salesRes.data.data);
    setConsultations(consultationsRes.data.data);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{
        token: string;
        user: User;
      }>('/login', {
        email,
        password,
        device_name: 'emi-expo-app',
      });

      await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      await fetchModules(response.data.token);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message ?? 'No se pudo iniciar sesion.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      if (token) {
        await api.post(
          '/logout',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch {
      // Si el token ya no existe en servidor, igual limpiamos estado local.
    } finally {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setInventory([]);
      setSales([]);
      setConsultations([]);
      setLoading(false);
    }
  };

  const createSale = async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      await api.post(
        '/sales',
        {
          product_name: saleProduct,
          quantity: Number(saleQty),
          unit_price: Number(salePrice),
          sold_at: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSaleProduct('');
      setSaleQty('1');
      setSalePrice('0');
      await fetchModules(token);
      Alert.alert('Venta registrada', 'El movimiento se guardo correctamente.');
    } catch {
      Alert.alert('Error', 'No se pudo registrar la venta.');
    } finally {
      setLoading(false);
    }
  };

  const createConsultation = async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      await api.post(
        '/consultations',
        {
          pet_name: petName,
          species: petSpecies,
          owner_name: ownerName,
          diagnosis,
          consulted_at: new Date().toISOString(),
          cost: 25,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPetName('');
      setOwnerName('');
      setDiagnosis('');
      await fetchModules(token);
      Alert.alert('Consulta registrada', 'La consulta fue guardada.');
    } catch {
      Alert.alert('Error', 'No se pudo registrar la consulta.');
    } finally {
      setLoading(false);
    }
  };

  const renderInventory = () => (
    <View style={styles.moduleCard}>
      <Text style={styles.moduleTitle}>Inventario</Text>
      {inventory.map((item) => (
        <View key={item.id} style={styles.rowItem}>
          <Text style={styles.rowTitle}>{item.name}</Text>
          <Text style={styles.rowText}>{item.category} | Stock: {item.stock} | ${item.unit_price}</Text>
        </View>
      ))}
      {inventory.length === 0 ? <Text style={styles.moduleText}>Sin productos.</Text> : null}
    </View>
  );

  const renderSales = () => (
    <View style={styles.moduleCard}>
      <Text style={styles.moduleTitle}>Punto de Venta</Text>
      <TextInput placeholder="Producto" style={styles.input} value={saleProduct} onChangeText={setSaleProduct} />
      <View style={styles.rowInputs}>
        <TextInput placeholder="Cantidad" keyboardType="numeric" style={[styles.input, styles.half]} value={saleQty} onChangeText={setSaleQty} />
        <TextInput placeholder="Precio" keyboardType="numeric" style={[styles.input, styles.half]} value={salePrice} onChangeText={setSalePrice} />
      </View>
      <Pressable style={styles.button} onPress={createSale} disabled={loading}>
        <Text style={styles.buttonText}>Registrar venta</Text>
      </Pressable>
      {sales.slice(0, 5).map((sale) => (
        <View key={sale.id} style={styles.rowItem}>
          <Text style={styles.rowTitle}>{sale.product_name}</Text>
          <Text style={styles.rowText}>x{sale.quantity} | Total ${sale.total}</Text>
        </View>
      ))}
    </View>
  );

  const renderConsultations = () => (
    <View style={styles.moduleCard}>
      <Text style={styles.moduleTitle}>Consultas</Text>
      <TextInput placeholder="Mascota" style={styles.input} value={petName} onChangeText={setPetName} />
      <TextInput placeholder="Especie" style={styles.input} value={petSpecies} onChangeText={setPetSpecies} />
      <TextInput placeholder="Propietario" style={styles.input} value={ownerName} onChangeText={setOwnerName} />
      <TextInput placeholder="Diagnostico" style={styles.input} value={diagnosis} onChangeText={setDiagnosis} />
      <Pressable style={styles.button} onPress={createConsultation} disabled={loading}>
        <Text style={styles.buttonText}>Registrar consulta</Text>
      </Pressable>
      {consultations.slice(0, 5).map((item) => (
        <View key={item.id} style={styles.rowItem}>
          <Text style={styles.rowTitle}>{item.pet_name} ({item.species})</Text>
          <Text style={styles.rowText}>{item.owner_name} | {item.diagnosis}</Text>
        </View>
      ))}
    </View>
  );

  if (booting) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#0b6e4f" />
        <Text style={styles.bootText}>Cargando Emi...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loginContainer}>
          <Text style={styles.brand}>Emi Veterinaria</Text>
          <Text style={styles.title}>Acceso movil</Text>
          <Text style={styles.subtitle}>Inventario, POS y consultas en una sola app.</Text>

          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Correo"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            placeholder="Contrasena"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Ingresando...' : 'Iniciar sesion'}</Text>
          </Pressable>

          <Text style={styles.helper}>
            Si usas dispositivo fisico, cambia API_BASE_URL en App.tsx por la IP local de tu PC.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.dashboardContainer}>
        <View style={styles.heroCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.heroBrand}>Emi Veterinaria</Text>
              <Text style={styles.welcome}>Hola, {user.name}</Text>
              <Text style={styles.heroEmail}>{user.email}</Text>
            </View>
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Salir</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeSection === 'inventory' && styles.tabActive]}
            onPress={() => setActiveSection('inventory')}
          >
            <Text style={[styles.tabText, activeSection === 'inventory' && styles.tabTextActive]}>Inventario</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeSection === 'sales' && styles.tabActive]}
            onPress={() => setActiveSection('sales')}
          >
            <Text style={[styles.tabText, activeSection === 'sales' && styles.tabTextActive]}>POS</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeSection === 'consultations' && styles.tabActive]}
            onPress={() => setActiveSection('consultations')}
          >
            <Text style={[styles.tabText, activeSection === 'consultations' && styles.tabTextActive]}>Consultas</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => token && fetchModules(token)}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Actualizar datos</Text>
        </Pressable>

        {activeSection === 'inventory' && renderInventory()}
        {activeSection === 'sales' && renderSales()}
        {activeSection === 'consultations' && renderConsultations()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef3f0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f8fb',
  },
  bootText: {
    marginTop: 12,
    color: '#4b5563',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  brand: {
    color: '#0b6e4f',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  button: {
    marginTop: 6,
    backgroundColor: '#0b6e4f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  error: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  helper: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 12,
  },
  dashboardContainer: {
    padding: 20,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#0a6b50',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#d9e5df',
  },
  tabActive: {
    backgroundColor: '#0b6e4f',
  },
  tabText: {
    color: '#111827',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBrand: {
    color: '#d1fae5',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  welcome: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '800',
  },
  heroEmail: {
    color: '#dcfce7',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#064e3b',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  moduleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 8,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    color: '#111827',
  },
  moduleText: {
    color: '#374151',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  half: {
    flex: 1,
  },
  rowItem: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 4,
  },
  rowTitle: {
    color: '#111827',
    fontWeight: '700',
  },
  rowText: {
    color: '#4b5563',
  },
});
