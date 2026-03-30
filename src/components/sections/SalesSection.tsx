import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SPECIES_OPTIONS } from '../../config';
import { InventoryItem, SaleFormValues, SaleItem } from '../../types';
import { AppButton } from '../ui/AppButton';
import { LabeledInput } from '../ui/LabeledInput';
import { LabeledSelect } from '../ui/LabeledSelect';
import { SectionCard } from '../ui/SectionCard';
import { StepMenu } from '../ui/StepMenu';

type Props = {
  inventory: InventoryItem[];
  sales: SaleItem[];
  loading: boolean;
  onCreate: (payload: SaleFormValues) => Promise<void>;
};

export function SalesSection({ inventory, sales, loading, onCreate }: Props) {
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [inventoryItemId, setInventoryItemId] = useState<string>('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('0');
  const [soldAt, setSoldAt] = useState(new Date().toISOString().slice(0, 16));
  const [customerName, setCustomerName] = useState('');

  const filteredInventory = useMemo(() => {
    if (!speciesFilter) {
      return inventory;
    }

    return inventory.filter((item) => {
      if (!item.target_species.trim()) {
        return true;
      }

      return item.target_species.toLowerCase().includes(speciesFilter.toLowerCase());
    });
  }, [inventory, speciesFilter]);

  const total = Number(quantity || 0) * Number(unitPrice || 0);

  const onSelectProduct = (value: string) => {
    setInventoryItemId(value);
    const selected = filteredInventory.find((item) => String(item.remote_id ?? item.local_id) === value);

    if (!selected) {
      return;
    }

    const composedName = selected.presentation ? `${selected.name} - ${selected.presentation}` : selected.name;
    setProductName(composedName);
    setUnitPrice(selected.unit_price.toFixed(2));
  };

  const submit = async () => {
    await onCreate({
      inventory_item_id: Number.isFinite(Number(inventoryItemId)) ? Number(inventoryItemId) : null,
      product_name: productName.trim(),
      quantity: Math.max(1, Number(quantity || 1)),
      unit_price: Math.max(0, Number(unitPrice || 0)),
      customer_name: customerName.trim(),
      sold_at: new Date(soldAt).toISOString(),
      species_filter: speciesFilter,
    });

    setInventoryItemId('');
    setProductName('');
    setQuantity('1');
    setUnitPrice('0');
    setCustomerName('');
    setSoldAt(new Date().toISOString().slice(0, 16));
    setStep(1);
    setMode('list');
  };

  const stepProgress = [
    { label: 'Paso 1', percent: step > 1 || inventoryItemId ? 100 : 40 },
    { label: 'Paso 2', percent: step > 2 || productName.trim() ? 100 : step >= 2 ? 50 : 0 },
    { label: 'Paso 3', percent: step === 3 ? 85 : 0 },
  ];

  return (
    <View className="gap-4 pb-4">
      {mode === 'list' ? (
        <>
          {/* Hero Card estilo tienda */}
          <View className="rounded-2xl bg-gradient-to-br from-violet-400 via-violet-500 to-purple-600 px-4 py-5 shadow-lg">
            <Text className="text-xs font-black uppercase tracking-wider text-white opacity-80">⭐ Acción Rápida</Text>
            <Text className="mt-2 text-2xl font-black text-white">Punto de Venta</Text>
            <Text className="mt-1 text-sm font-medium text-white opacity-90">Venta rápida estilo tienda</Text>
            <Pressable
              onPress={() => setMode('form')}
              className="mt-4 flex-row items-center justify-between rounded-lg bg-white/20 px-4 py-3 active:opacity-80"
            >
              <View>
                <Text className="font-bold text-white">Nueva venta</Text>
                <Text className="text-xs text-white opacity-85">Toca para continuar</Text>
              </View>
              <Text className="text-2xl">🛒</Text>
            </Pressable>
          </View>

          {/* Últimas Ventas - Estilo Recibo */}
          <SectionCard title="Últimas Transacciones" subtitle="Ultimos 8 registros (estilo recibo de tienda)">
            {sales.length === 0 ? (
              <View className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4">
                <Text className="text-center text-sm text-slate-500">📭 Sin ventas registradas aún</Text>
              </View>
            ) : (
              <View className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {/* Encabezado tipo recibo */}
              <View className="flex-row bg-gradient-to-r from-violet-100 to-violet-50 px-3 py-2">
                  <Text className="flex-1 text-xs font-black uppercase text-violet-800">Producto</Text>
                  <Text className="w-14 text-center text-xs font-black uppercase text-violet-800">Cant.</Text>
                  <Text className="w-20 text-right text-xs font-black uppercase text-violet-800">Total</Text>
                </View>

                {/* Filas de ventas */}
                {sales.slice(0, 8).map((sale, idx) => (
                  <View key={sale.local_id} className="flex-row items-center px-3 py-2.5">
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-slate-900" numberOfLines={1}>
                        {sale.product_name}
                      </Text>
                      <Text className="text-xs text-slate-500">
                        {sale.customer_name ? `👤 ${sale.customer_name}` : '👤 General'}
                      </Text>
                    </View>
                    <Text className="w-14 text-center text-xs font-bold text-slate-700">x{sale.quantity}</Text>
                    <Text className="w-20 text-right text-xs font-black text-violet-600">
                      ${sale.total.toFixed(2)}
                    </Text>
                  </View>
                ))}

                {/* Línea de separación tipo recibo */}
                <View className="border-t-2 border-dashed border-slate-300 px-3 py-2">
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-bold text-slate-600">TOTAL DE VENTAS</Text>
                    <Text className="text-sm font-black text-violet-600">
                      ${sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </SectionCard>
        </>
      ) : null}

      {mode === 'form' ? (
        <SectionCard title="Nueva Venta" subtitle="Forma rápida de captura por pasos">
          <View className="flex-row justify-end gap-2 mb-3">
            <Pressable
              onPress={() => setMode('list')}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 active:bg-slate-50"
            >
              <Text className="text-xs font-bold text-slate-700">← Volver</Text>
            </Pressable>
          </View>

          <StepMenu steps={stepProgress} currentStep={step} onSelectStep={(next) => setStep(next as 1 | 2 | 3)} />

          {step === 1 ? (
            <View className="gap-3">
              <LabeledSelect
                label="🐕 Especie"
                selectedValue={speciesFilter}
                onValueChange={setSpeciesFilter}
                options={SPECIES_OPTIONS.map((species) => ({ label: species, value: species }))}
                placeholderLabel="Todas las especies"
                placeholderValue=""
                selectedLabel={speciesFilter || 'Todas las especies'}
                helperText="Filtra el catálogo para encontrar producto rápido."
              />

              <LabeledSelect
                label="📦 Producto"
                selectedValue={inventoryItemId}
                onValueChange={onSelectProduct}
                options={filteredInventory.map((item) => ({
                  label: item.presentation ? `${item.name} - ${item.presentation}` : item.name,
                  value: String(item.remote_id ?? item.local_id),
                }))}
                placeholderLabel="Selecciona un producto"
                placeholderValue=""
                selectedLabel={productName || 'Selecciona un producto'}
                helperText="Se autocompleta el nombre y precio automáticamente."
              />

              <View className="rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 px-3 py-2">
                <Text className="text-xs font-bold text-violet-800">
                  {inventoryItemId
                    ? '✅ Producto seleccionado. Continúa al paso 2.'
                    : '⏳ Selecciona especie y producto para continuar.'}
                </Text>
              </View>

              {inventoryItemId ? (
                <Pressable
                  onPress={() => setStep(2)}
                  className="rounded-lg bg-gradient-to-r from-violet-400 to-violet-500 px-3 py-2 active:opacity-80"
                >
                  <Text className="text-center font-bold text-white">Continuar al Paso 2 →</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {step === 2 ? (
            <View className="gap-3">
              <LabeledInput
                label="🏷️ Nombre del producto"
                value={productName}
                onChangeText={setProductName}
                placeholder="Auto-rellenado"
              />

              <LabeledInput
                label="📊 Cantidad"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                placeholder="1"
              />

              <LabeledInput
                label="💵 Precio unitario"
                value={unitPrice}
                onChangeText={setUnitPrice}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />

              {/* Preview de Total */}
              <View className="rounded-lg border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-3">
                <Text className="text-xs text-violet-700">Total a cobrar:</Text>
                <Text className="text-2xl font-black text-violet-600">
                  ${total.toFixed(2)}
                </Text>
              </View>

              <LabeledInput
                label="📅 Fecha y hora"
                value={soldAt}
                onChangeText={setSoldAt}
                placeholder={new Date().toISOString().slice(0, 16)}
              />

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setStep(1)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 active:bg-slate-50"
                >
                  <Text className="text-center text-xs font-bold text-slate-700">← Paso 1</Text>
                </Pressable>
                <Pressable
                  onPress={() => setStep(3)}
                  className="flex-1 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-2 active:opacity-80"
                >
                  <Text className="text-center text-xs font-bold text-white">Paso 3 →</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {step === 3 ? (
            <View className="gap-3">
              <View className="rounded-lg border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-3">
                <Text className="mb-3 text-xs font-bold uppercase text-slate-600">Resumen de venta</Text>

                <View className="gap-2 border-b border-slate-200 pb-3">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-600">Producto:</Text>
                    <Text className="font-bold text-slate-900">{productName}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-600">Cantidad:</Text>
                    <Text className="font-bold text-slate-900">x{quantity}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-600">Precio unitario:</Text>
                    <Text className="font-bold text-slate-900">${Number(unitPrice).toFixed(2)}</Text>
                  </View>
                </View>

                <View className="mt-3 flex-row justify-between border-t-2 border-violet-300 pt-3">
                  <Text className="text-sm font-black text-slate-900">Total:</Text>
                  <Text className="text-lg font-black text-violet-600">${total.toFixed(2)}</Text>
                </View>
              </View>

              <LabeledInput
                label="👤 Cliente (opcional)"
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Juan Pérez"
              />

              <View className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <Text className="text-xs text-center font-bold text-green-800">
                  ✅ Datos completos. Listo para registrar.
                </Text>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setStep(2)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-3 active:bg-slate-50"
                >
                  <Text className="text-center text-xs font-bold text-slate-700">← Atrás</Text>
                </Pressable>
                <AppButton
                  label={`Registrar Venta ($${total.toFixed(2)})`}
                  onPress={submit}
                  disabled={loading}
                />
              </View>
            </View>
          ) : null}
        </SectionCard>
      ) : null}
    </View>
  );
}

