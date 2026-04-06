import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SPECIES_OPTIONS } from '../../config';
import { ConsultationFormValues, ConsultationItem, InventoryItem, MedicationLine, PetCatalogItem, PricingRuleItem, SpeciesCatalogItem } from '../../types';
import { AppButton } from '../ui/AppButton';
import { LabeledInput } from '../ui/LabeledInput';
import { LabeledSelect } from '../ui/LabeledSelect';
import { SectionCard } from '../ui/SectionCard';
import { StepMenu } from '../ui/StepMenu';

type Props = {
  consultations: ConsultationItem[];
  inventory: InventoryItem[];
  petsCatalog: PetCatalogItem[];
  speciesCatalog: SpeciesCatalogItem[];
  pricingRules: PricingRuleItem[];
  loading: boolean;
  onCreate: (payload: ConsultationFormValues) => Promise<void>;
};

function emptyMedication(): MedicationLine {
  return {
    id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    inventory_label: '',
    quantity: '1',
    unit_price: '0',
    dosage: '',
    frequency_hours: '',
    duration_days: '',
    notes: '',
  };
}

export function ConsultationsSection({
  consultations,
  inventory,
  petsCatalog,
  speciesCatalog,
  pricingRules,
  loading,
  onCreate,
}: Props) {
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, string>>({});
  const [petId, setPetId] = useState<number | null>(null);
  const [speciesId, setSpeciesId] = useState<number | null>(null);
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('Canino');
  const [petBreed, setPetBreed] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [petSize, setPetSize] = useState('');
  const [consultedAt, setConsultedAt] = useState(new Date().toISOString().slice(0, 16));
  const [cost, setCost] = useState('0');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [vaccinationApplied, setVaccinationApplied] = useState(false);
  const [vaccinationNote, setVaccinationNote] = useState('');
  const [nextVaccinationAt, setNextVaccinationAt] = useState('');
  const [dewormingApplied, setDewormingApplied] = useState(false);
  const [dewormingNote, setDewormingNote] = useState('');
  const [nextDewormingAt, setNextDewormingAt] = useState('');
  const [medications, setMedications] = useState<MedicationLine[]>([emptyMedication()]);

  const petOptions = petsCatalog.map((pet) => ({
    key: String(pet.id),
    pet_id: pet.id,
    species_id: pet.species_id,
    pet_name: pet.name,
    owner_name: pet.owner_name,
    species: speciesCatalog.find((item) => item.id === pet.species_id)?.name || 'Canino',
    pet_breed: pet.breed,
    pet_size: pet.size_category,
  }));

  const diagnosisCatalog = consultations.reduce<string[]>((acc, item) => {
    const value = item.diagnosis.trim();
    if (value && !acc.some((entry) => entry.toLowerCase() === value.toLowerCase())) {
      acc.push(value);
    }
    return acc;
  }, []);

  const speciesOptions = Array.from(
    new Set([...SPECIES_OPTIONS, ...speciesCatalog.map((item) => item.name).filter(Boolean), ...consultations.map((item) => item.species).filter(Boolean)])
  );

  const pricingMap = pricingRules.reduce<Record<string, number>>((acc, rule) => {
    const speciesName = speciesCatalog.find((item) => item.id === rule.species_id)?.name || '';
    if (!speciesName || !rule.diagnosis) {
      return acc;
    }

    const key = `${speciesName.trim().toLowerCase()}|${rule.diagnosis.trim().toLowerCase()}`;
    acc[key] = Number(rule.default_cost || 0);
    return acc;
  }, {});

  const resolveCost = (nextSpecies: string, nextDiagnosis: string) => {
    const key = `${nextSpecies.trim().toLowerCase()}|${nextDiagnosis.trim().toLowerCase()}`;
    const resolved = pricingMap[key];

    if (typeof resolved !== 'number') {
      return;
    }

    setCost(resolved.toFixed(2));
  };

  const onPetChange = (value: string) => {
    setSelectedPet(value);
    if (!value) {
      return;
    }

    const pet = petOptions.find((entry) => entry.key === value);
    if (!pet) {
      return;
    }

    setPetId(pet.pet_id || null);
    setSpeciesId(pet.species_id || null);
    setPetName(pet.pet_name);
    setSpecies(pet.species || 'Canino');
    setOwnerName(pet.owner_name || '');
    setPetBreed(pet.pet_breed || '');
    setPetSize(pet.pet_size || '');
    resolveCost(pet.species || 'Canino', diagnosis);
  };

  const onDiagnosisChange = (value: string) => {
    setDiagnosis(value);
    resolveCost(species, value);
  };

  const onSpeciesChange = (value: string) => {
    setSpecies(value);
    const found = speciesCatalog.find((item) => item.name.toLowerCase() === value.toLowerCase());
    setSpeciesId(found ? found.id : null);
    resolveCost(value, diagnosis);
  };

  const baseStepDone = Boolean(selectedPet || (petName.trim() && species.trim() && ownerName.trim()));
  const treatmentStepDone = Boolean(treatment.trim());
  const productsStepDone = medications.some((line) => line.inventory_label.trim());

  const onMedicationSelect = (id: string, value: string) => {
    setSelectedProducts((current) => ({ ...current, [id]: value }));

    const selected = inventory.find((item) => String(item.remote_id ?? item.local_id) === value);

    if (!selected) {
      return;
    }

    const label = selected.presentation ? `${selected.name} - ${selected.presentation}` : selected.name;

    setMedications((current) =>
      current.map((line) =>
        line.id === id
          ? {
              ...line,
              inventory_label: label,
              unit_price: selected.unit_price.toFixed(2),
            }
          : line
      )
    );
  };

  const updateMedication = (id: string, key: keyof MedicationLine, value: string) => {
    setMedications((current) => current.map((line) => (line.id === id ? { ...line, [key]: value } : line)));
  };

  const addMedication = () => {
    setMedications((current) => [...current, emptyMedication()]);
  };

  const removeMedication = (id: string) => {
    setMedications((current) => (current.length === 1 ? current : current.filter((line) => line.id !== id)));
    setSelectedProducts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const submit = async () => {
    await onCreate({
      pet_id: petId,
      species_id: speciesId,
      pet_name: petName.trim(),
      species,
      owner_name: ownerName.trim(),
      pet_breed: petBreed.trim(),
      pet_size: petSize.trim(),
      diagnosis: diagnosis.trim(),
      treatment: treatment.trim(),
      cost: Number(cost || 0),
      consulted_at: new Date(consultedAt).toISOString(),
      vaccination_applied: vaccinationApplied,
      vaccination_note: vaccinationNote.trim(),
      next_vaccination_at: nextVaccinationAt.trim(),
      deworming_applied: dewormingApplied,
      deworming_note: dewormingNote.trim(),
      next_deworming_at: nextDewormingAt.trim(),
      medications_json: JSON.stringify(medications),
      images_json: '[]',
    });

    setPetName('');
    setPetId(null);
    setSpeciesId(null);
    setSelectedPet('');
    setSelectedProducts({});
    setPetBreed('');
    setOwnerName('');
    setPetSize('');
    setConsultedAt(new Date().toISOString().slice(0, 16));
    setCost('0');
    setDiagnosis('');
    setTreatment('');
    setVaccinationApplied(false);
    setVaccinationNote('');
    setNextVaccinationAt('');
    setDewormingApplied(false);
    setDewormingNote('');
    setNextDewormingAt('');
    setMedications([emptyMedication()]);
    setStep(1);
    setMode('list');
  };

  const stepProgress = [
    { label: 'Paso 1', percent: baseStepDone ? 100 : step === 1 ? 42 : 0 },
    { label: 'Paso 2', percent: treatmentStepDone ? 100 : step === 2 ? 50 : 0 },
    { label: 'Paso 3', percent: productsStepDone ? 100 : step === 3 ? 65 : 0 },
  ];

  return (
    <View className="gap-3">
      {mode === 'list' ? (
        <SectionCard title="Ultimas consultas" subtitle="Vista inicial con los ultimos registros capturados.">
          <AppButton label="Agregar nuevo" onPress={() => setMode('form')} style={{ marginBottom: 8 }} />

          <View className="overflow-hidden rounded-xl border border-slate-200">
            <View className="flex-row bg-slate-100 px-3 py-2">
              <Text className="flex-1 text-[11px] font-black uppercase text-slate-600">Mascota</Text>
              <Text className="flex-1 text-[11px] font-black uppercase text-slate-600">Diagnostico</Text>
              <Text className="w-20 text-right text-[11px] font-black uppercase text-slate-600">Costo</Text>
            </View>
            {consultations.slice(0, 12).map((item) => (
              <View key={item.local_id} className="flex-row items-center border-t border-slate-200 bg-white px-3 py-2">
                <Text className="flex-1 text-[12px] font-bold text-slate-900" numberOfLines={1}>{item.pet_name}</Text>
                <Text className="flex-1 text-[12px] text-slate-600" numberOfLines={1}>{item.diagnosis}</Text>
                <Text className="w-20 text-right text-[12px] font-extrabold text-violet-700">${item.cost.toFixed(2)}</Text>
              </View>
            ))}
            {consultations.length === 0 ? <Text className="px-3 py-3 text-slate-500">No hay consultas registradas.</Text> : null}
          </View>
        </SectionCard>
      ) : null}

      {mode === 'form' ? (
        <SectionCard title="Nueva consulta" subtitle="Formulario por pasos con menu tipo Aguas.">
          <View className="flex-row justify-end">
            <Pressable onPress={() => setMode('list')} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5">
              <Text className="text-[12px] font-bold text-slate-700">Volver a tabla</Text>
            </Pressable>
          </View>

          <StepMenu steps={stepProgress} currentStep={step} onSelectStep={(next) => setStep(next as 1 | 2 | 3)} />

        {step === 1 ? (
          <View className="gap-2">
            <Text className="text-[15px] font-black text-slate-900">Datos base</Text>

            <LabeledSelect
              label="Mascota registrada"
              selectedValue={selectedPet}
              onValueChange={onPetChange}
              options={petOptions.map((pet) => ({
                label: `${pet.pet_name}${pet.owner_name ? ` - ${pet.owner_name}` : ''}`,
                value: pet.key,
              }))}
              placeholderLabel="Selecciona mascota"
              placeholderValue=""
              selectedLabel={selectedPet ? `${petName}${ownerName ? ` - ${ownerName}` : ''}` : ''}
              helperText="Al elegir mascota se completan especie, propietario, raza y talla."
            />

            <LabeledInput label="Mascota" value={petName} onChangeText={setPetName} />

            <LabeledSelect
              label="Especie"
              selectedValue={species}
              onValueChange={onSpeciesChange}
              options={speciesOptions.map((item) => ({ label: item, value: item }))}
              helperText="La especie ayuda a sugerir costos historicos por diagnostico."
            />

            <View className="flex-row gap-2">
              <View className="flex-1">
                <LabeledInput label="Tipo" value={petBreed} onChangeText={setPetBreed} placeholder="Raza" editable={!selectedPet} />
              </View>
              <View className="flex-1">
                <LabeledInput label="Propietario" value={ownerName} onChangeText={setOwnerName} />
              </View>
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <LabeledInput
                  label="Talla"
                  value={petSize}
                  onChangeText={setPetSize}
                  placeholder="Pequena/Mediana/Grande"
                  editable={!selectedPet}
                />
              </View>
              <View className="flex-1">
                <LabeledInput label="Fecha y hora" value={consultedAt} onChangeText={setConsultedAt} placeholder="YYYY-MM-DDTHH:mm" />
              </View>
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <LabeledInput label="Costo" value={cost} onChangeText={setCost} keyboardType="numeric" />
              </View>
              <View className="flex-[2]">
                <LabeledInput label="Diagnostico" value={diagnosis} onChangeText={onDiagnosisChange} />
              </View>
            </View>

            {diagnosisCatalog.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {diagnosisCatalog.slice(0, 8).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => onDiagnosisChange(item)}
                    className="rounded-full border border-violet-300 bg-violet-50 px-2.5 py-1"
                  >
                    <Text className="text-[12px] font-bold text-violet-800">{item}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <View className="mt-2 gap-2 rounded-xl border border-violet-200 bg-violet-50 p-3">
              <Text className="text-[13px] font-extrabold text-violet-900">Control preventivo</Text>

              <View className="flex-row gap-2">
                <AppButton
                  label={vaccinationApplied ? 'Vacunacion: si' : 'Vacunacion: no'}
                  onPress={() => setVaccinationApplied((current) => !current)}
                  style={{ flex: 1, backgroundColor: vaccinationApplied ? '#5d4a82' : '#8b78b9' }}
                />
                <AppButton
                  label={dewormingApplied ? 'Desparasitacion: si' : 'Desparasitacion: no'}
                  onPress={() => setDewormingApplied((current) => !current)}
                  style={{ flex: 1, backgroundColor: dewormingApplied ? '#5d4a82' : '#8b78b9' }}
                />
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <LabeledInput label="Nota vacuna" value={vaccinationNote} onChangeText={setVaccinationNote} />
                </View>
                <View className="flex-1">
                  <LabeledInput label="Proxima vacuna" value={nextVaccinationAt} onChangeText={setNextVaccinationAt} placeholder="YYYY-MM-DD" />
                </View>
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <LabeledInput label="Nota desparasitacion" value={dewormingNote} onChangeText={setDewormingNote} />
                </View>
                <View className="flex-1">
                  <LabeledInput label="Proxima desparasitacion" value={nextDewormingAt} onChangeText={setNextDewormingAt} placeholder="YYYY-MM-DD" />
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View className="gap-2">
            <Text className="text-[15px] font-black text-slate-900">Tratamiento</Text>
            <LabeledInput
              label="Detalle clinico"
              value={treatment}
              onChangeText={setTreatment}
              multiline
              numberOfLines={5}
              style={{ textAlignVertical: 'top', minHeight: 110 }}
            />
          </View>
        ) : null}

        {step === 3 ? (
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-[15px] font-black text-slate-900">Productos</Text>
              <Pressable onPress={addMedication} className="rounded-lg bg-violet-100 px-2.5 py-1.5">
                <Text className="font-extrabold text-violet-800">+ Producto</Text>
              </Pressable>
            </View>

            {medications.map((line) => (
              <View key={line.id} className="gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <LabeledSelect
                  label="Producto de inventario"
                  selectedValue={selectedProducts[line.id] ?? ''}
                  onValueChange={(value) => onMedicationSelect(line.id, value)}
                  options={inventory.map((item) => ({
                    label: item.presentation ? `${item.name} - ${item.presentation}` : item.name,
                    value: String(item.remote_id ?? item.local_id),
                  }))}
                  placeholderLabel="Selecciona producto"
                  placeholderValue=""
                  selectedLabel={line.inventory_label}
                />

                <LabeledInput
                  label="Medicacion / producto"
                  value={line.inventory_label}
                  onChangeText={(value) => updateMedication(line.id, 'inventory_label', value)}
                />

                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <LabeledInput label="Cantidad" value={line.quantity} onChangeText={(value) => updateMedication(line.id, 'quantity', value)} keyboardType="numeric" />
                  </View>
                  <View className="flex-1">
                    <LabeledInput label="Precio" value={line.unit_price} onChangeText={(value) => updateMedication(line.id, 'unit_price', value)} keyboardType="numeric" />
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <LabeledInput label="Dosis" value={line.dosage} onChangeText={(value) => updateMedication(line.id, 'dosage', value)} />
                  </View>
                  <View className="flex-1">
                    <LabeledInput
                      label="Frecuencia (hrs)"
                      value={line.frequency_hours}
                      onChangeText={(value) => updateMedication(line.id, 'frequency_hours', value)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <LabeledInput
                      label="Duracion (dias)"
                      value={line.duration_days}
                      onChangeText={(value) => updateMedication(line.id, 'duration_days', value)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <LabeledInput label="Notas" value={line.notes} onChangeText={(value) => updateMedication(line.id, 'notes', value)} />

                <Pressable onPress={() => removeMedication(line.id)} className="self-end">
                  <Text className="font-bold text-red-700">Quitar</Text>
                </Pressable>
              </View>
            ))}
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
            <AppButton label="Guardar consulta" onPress={submit} loading={loading} disabled={!petName.trim() || !diagnosis.trim()} style={{ flex: 1 }} />
          )}
        </View>
      </SectionCard>
      ) : null}
    </View>
  );
}

