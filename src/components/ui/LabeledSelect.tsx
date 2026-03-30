import { Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  selectedValue: string;
  options: Option[];
  onValueChange: (value: string) => void;
  placeholderLabel?: string;
  placeholderValue?: string;
  selectedLabel?: string;
  helperText?: string;
};

export function LabeledSelect({
  label,
  selectedValue,
  options,
  onValueChange,
  placeholderLabel,
  placeholderValue = '',
  selectedLabel,
  helperText,
}: Props) {
  const resolvedLabel =
    selectedLabel ?? options.find((option) => option.value === selectedValue)?.label ?? '';
  const selected = Boolean(selectedValue);

  return (
    <View className="mb-1 gap-1.5">
      <Text className="text-[13px] font-extrabold text-slate-800">{label}</Text>
      <View className={`overflow-hidden rounded-xl border bg-white ${selected ? 'border-[#8b78b9]' : 'border-slate-300'}`}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(value) => onValueChange(String(value))}
          style={{ height: 54 }}
        >
          {placeholderLabel ? <Picker.Item label={placeholderLabel} value={placeholderValue} /> : null}
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>

      <View className={`rounded-lg border px-2.5 py-1.5 ${selected ? 'border-[#cdbfe6] bg-[#f4f1fb]' : 'border-slate-300 bg-slate-50'}`}>
        <Text className={`text-[12px] font-bold ${selected ? 'text-[#3a334d]' : 'text-slate-500'}`}>
          {selected ? `Seleccionado: ${resolvedLabel || selectedValue}` : 'Sin seleccion'}
        </Text>
        {helperText ? <Text className="mt-0.5 text-[11px] text-slate-500">{helperText}</Text> : null}
      </View>
    </View>
  );
}
