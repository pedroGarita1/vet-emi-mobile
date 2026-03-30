import { useMemo, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { SALE_UNITS } from '../../config';
import { InventoryFormValues, InventoryItem } from '../../types';
import { AppButton } from '../ui/AppButton';
import { LabeledInput } from '../ui/LabeledInput';
import { LabeledSelect } from '../ui/LabeledSelect';
import { SectionCard } from '../ui/SectionCard';
import { StepMenu } from '../ui/StepMenu';

type Props = {
  items: InventoryItem[];
  loading: boolean;
  onCreate: (payload: InventoryFormValues) => Promise<void>;
};

export function InventorySection({ items, loading, onCreate }: Props) {
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [presentation, setPresentation] = useState('');
  const [saleUnit, setSaleUnit] = useState('unidad');
  const [targetSpecies, setTargetSpecies] = useState('');
  const [stock, setStock] = useState('0');
  const [unitPrice, setUnitPrice] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const canSubmit = useMemo(() => name.trim() && category.trim(), [name, category]);

  const submit = async () => {
    if (!canSubmit) {
      return;
    }

    await onCreate({
      name: name.trim(),
      category: category.trim(),
      presentation: presentation.trim(),
      sale_unit: saleUnit,
      target_species: targetSpecies.trim(),
      stock: Number(stock || 0),
      unit_price: Number(unitPrice || 0),
      min_stock: Number(minStock || 0),
      is_active: isActive,
    });

    setName('');
    setCategory('');
    setPresentation('');
    setSaleUnit('unidad');
    setTargetSpecies('');
    setStock('0');
    setUnitPrice('0');
    setMinStock('0');
    setIsActive(true);
    setStep(1);
    setMode('list');
  };

  const stepProgress = [
    { label: 'Paso 1', percent: step > 1 ? 100 : name.trim() && category.trim() ? 65 : 20 },
    { label: 'Paso 2', percent: step > 2 ? 100 : step === 2 ? 45 : 0 },
    { label: 'Paso 3', percent: step === 3 ? 80 : 0 },
  ];

  return (
    <View className="gap-3">
      {mode === 'list' ? (
        <SectionCard title="Ultimos productos" subtitle="Vista inicial con los registros mas recientes.">
          <AppButton label="Agregar nuevo" onPress={() => setMode('form')} style={{ marginBottom: 8 }} />

          <View className="overflow-hidden rounded-xl border border-slate-200">
            <View className="flex-row bg-slate-100 px-3 py-2">
              <Text className="flex-1 text-[11px] font-black uppercase text-slate-600">Producto</Text>
              <Text className="w-20 text-center text-[11px] font-black uppercase text-slate-600">Stock</Text>
              <Text className="w-24 text-right text-[11px] font-black uppercase text-slate-600">Precio</Text>
            </View>
            {items.slice(0, 12).map((item) => (
              <View key={item.local_id} className="flex-row items-center border-t border-slate-200 bg-white px-3 py-2">
                <Text className="flex-1 text-[12px] font-bold text-slate-900" numberOfLines={1}>{item.name}</Text>
                <Text className="w-20 text-center text-[12px] text-slate-600">{item.stock}</Text>
                <Text className="w-24 text-right text-[12px] font-extrabold text-violet-700">${item.unit_price.toFixed(2)}</Text>
              </View>
            ))}
            {items.length === 0 ? <Text className="px-3 py-3 text-slate-500">Sin registros todavia.</Text> : null}
          </View>
        </SectionCard>
      ) : null}

      {mode === 'form' ? (
        <SectionCard title="Nuevo producto" subtitle="Captura por pasos como en el menu de Aguas.">
          <View className="flex-row justify-end">
            <Pressable onPress={() => setMode('list')} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5">
              <Text className="text-[12px] font-bold text-slate-700">Volver a tabla</Text>
            </Pressable>
          </View>

          <StepMenu steps={stepProgress} currentStep={step} onSelectStep={(next) => setStep(next as 1 | 2 | 3)} />

        {step === 1 ? (
          <View className="gap-2">
            <LabeledInput label="Nombre" value={name} onChangeText={setName} placeholder="Ej: Amoxicilina" />
            <LabeledInput label="Categoria" value={category} onChangeText={setCategory} placeholder="Medicamento" />
            <LabeledInput label="Presentacion" value={presentation} onChangeText={setPresentation} placeholder="Frasco 350 ml" />
            <LabeledSelect
              label="Unidad de venta"
              selectedValue={saleUnit}
              onValueChange={setSaleUnit}
              options={SALE_UNITS.map((unit) => ({ label: unit, value: unit }))}
              helperText="Confirma la unidad exacta para calcular ventas y stock."
            />
          </View>
        ) : null}

        {step === 2 ? (
          <View className="gap-2">
            <LabeledInput
              label="Especies objetivo"
              value={targetSpecies}
              onChangeText={setTargetSpecies}
              placeholder="Canino,Felino (vacio aplica a todas)"
            />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <LabeledInput label="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <LabeledInput label="Precio unitario" value={unitPrice} onChangeText={setUnitPrice} keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <LabeledInput label="Stock minimo" value={minStock} onChangeText={setMinStock} keyboardType="numeric" />
              </View>
            </View>
          </View>
        ) : null}

        {step === 3 ? (
          <View className="gap-2">
            <View className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Text className="text-[13px] font-extrabold text-slate-800">Activo</Text>
              <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: '#cfc2ea' }} thumbColor={isActive ? '#6b56a0' : '#94a3b8'} />
            </View>

            <View className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Text className="text-[12px] font-bold text-slate-600">Resumen</Text>
              <Text className="mt-1 text-[13px] text-slate-700">{name || 'Sin nombre'} | {category || 'Sin categoria'}</Text>
              <Text className="text-[13px] text-slate-700">Stock: {stock} | Precio: ${Number(unitPrice || 0).toFixed(2)}</Text>
            </View>
          </View>
        ) : null}

        <View className="flex-row gap-2">
          <AppButton
            label="Anterior"
            onPress={() => setStep((current) => (current === 1 ? 1 : ((current - 1) as 1 | 2 | 3)))}
            disabled={step === 1}
            style={{ flex: 1, backgroundColor: '#64748b' }}
          />
          {step < 3 ? (
            <AppButton
              label="Siguiente"
              onPress={() => setStep((current) => (current === 3 ? 3 : ((current + 1) as 1 | 2 | 3)))}
              style={{ flex: 1 }}
            />
          ) : (
            <AppButton label="Guardar producto" onPress={submit} disabled={!canSubmit} loading={loading} style={{ flex: 1 }} />
          )}
        </View>
      </SectionCard>
      ) : null}
    </View>
  );
}

