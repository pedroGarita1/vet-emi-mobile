import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { EsteticaFormValues, EsteticaItem, PetCatalogItem } from '../../types';
import { AppButton } from '../ui/AppButton';
import { LabeledInput } from '../ui/LabeledInput';
import { LabeledSelect } from '../ui/LabeledSelect';
import { SectionCard } from '../ui/SectionCard';

type Props = {
  services: EsteticaItem[];
  petsCatalog: PetCatalogItem[];
  loading: boolean;
  onCreate: (payload: EsteticaFormValues) => Promise<void>;
};

export function EsteticaSection({ services, petsCatalog, loading, onCreate }: Props) {
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [selectedPet, setSelectedPet] = useState('');
  const [petId, setPetId] = useState<number | null>(null);
  const [petName, setPetName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [requestedAt, setRequestedAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');

  const petOptions = useMemo(
    () =>
      petsCatalog.map((pet) => ({
        value: String(pet.id),
        label: `${pet.name}${pet.owner_name ? ` - ${pet.owner_name}` : ''}`,
      })),
    [petsCatalog]
  );

  const onPetChange = (value: string) => {
    setSelectedPet(value);
    const pet = petsCatalog.find((item) => String(item.id) === value);

    if (!pet) {
      return;
    }

    setPetId(pet.id);
    setPetName(pet.name || '');
    setOwnerName(pet.owner_name || '');
    setOwnerEmail(pet.owner_email || '');
    setOwnerPhone(pet.owner_phone || '');
  };

  const submit = async () => {
    await onCreate({
      pet_id: petId,
      pet_name: petName.trim(),
      owner_name: ownerName.trim(),
      owner_phone: ownerPhone.trim(),
      owner_email: ownerEmail.trim(),
      service_type: serviceType.trim(),
      status: 'pendiente',
      notes: notes.trim(),
      requested_at: new Date(requestedAt).toISOString(),
      images_json: '[]',
    });

    setSelectedPet('');
    setPetId(null);
    setPetName('');
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPhone('');
    setServiceType('');
    setRequestedAt(new Date().toISOString().slice(0, 16));
    setNotes('');
    setMode('list');
  };

  return (
    <View className="gap-3">
      {mode === 'list' ? (
        <SectionCard title="Servicios de estetica" subtitle="Registro y seguimiento operativo del servicio.">
          <AppButton label="Agregar nuevo" onPress={() => setMode('form')} style={{ marginBottom: 8 }} />

          <View className="overflow-hidden rounded-xl border border-slate-200">
            <View className="flex-row bg-slate-100 px-3 py-2">
              <Text className="flex-1 text-[11px] font-black uppercase text-slate-600">Mascota</Text>
              <Text className="flex-1 text-[11px] font-black uppercase text-slate-600">Servicio</Text>
              <Text className="w-24 text-right text-[11px] font-black uppercase text-slate-600">Estado</Text>
            </View>
            {services.slice(0, 12).map((item) => (
              <View key={item.local_id} className="flex-row items-center border-t border-slate-200 bg-white px-3 py-2">
                <Text className="flex-1 text-[12px] font-bold text-slate-900" numberOfLines={1}>{item.pet_name}</Text>
                <Text className="flex-1 text-[12px] text-slate-600" numberOfLines={1}>{item.service_type}</Text>
                <Text className="w-24 text-right text-[12px] font-extrabold text-violet-700">{item.status}</Text>
              </View>
            ))}
            {services.length === 0 ? <Text className="px-3 py-3 text-slate-500">No hay servicios registrados.</Text> : null}
          </View>
        </SectionCard>
      ) : null}

      {mode === 'form' ? (
        <SectionCard title="Nuevo servicio" subtitle="Misma logica del web: autollenado por mascota.">
          <View className="flex-row justify-end">
            <Pressable onPress={() => setMode('list')} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5">
              <Text className="text-[12px] font-bold text-slate-700">Volver a tabla</Text>
            </Pressable>
          </View>

          <View className="gap-2">
            <LabeledSelect
              label="Mascota registrada"
              selectedValue={selectedPet}
              onValueChange={onPetChange}
              options={petOptions}
              placeholderLabel="Selecciona mascota"
              placeholderValue=""
              helperText="Autocompleta dueño, correo y telefono."
            />

            <LabeledInput label="Nombre mascota" value={petName} onChangeText={setPetName} />
            <LabeledInput label="Dueño" value={ownerName} onChangeText={setOwnerName} />

            <View className="flex-row gap-2">
              <View className="flex-1">
                <LabeledInput label="Correo" value={ownerEmail} onChangeText={setOwnerEmail} keyboardType="email-address" />
              </View>
              <View className="flex-1">
                <LabeledInput label="Telefono" value={ownerPhone} onChangeText={setOwnerPhone} keyboardType="phone-pad" />
              </View>
            </View>

            <LabeledInput label="Servicio" value={serviceType} onChangeText={setServiceType} placeholder="Bano, corte, limpieza" />
            <LabeledInput label="Fecha y hora" value={requestedAt} onChangeText={setRequestedAt} placeholder="YYYY-MM-DDTHH:mm" />
            <LabeledInput label="Notas" value={notes} onChangeText={setNotes} multiline numberOfLines={4} style={{ textAlignVertical: 'top', minHeight: 96 }} />

            <AppButton
              label="Guardar servicio"
              onPress={submit}
              loading={loading}
              disabled={!petName.trim() || !serviceType.trim()}
            />
          </View>
        </SectionCard>
      ) : null}
    </View>
  );
}
