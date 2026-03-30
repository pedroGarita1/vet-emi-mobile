import { Text, TextInput, TextInputProps, View } from 'react-native';

type Props = {
  label: string;
} & TextInputProps;

export function LabeledInput({ label, style, ...props }: Props) {
  const isMultiline = Boolean(props.multiline);
  const showLabel = Boolean(label && label.trim().length > 0);

  return (
    <View className="mb-1 gap-1.5">
      {showLabel ? <Text className="text-[13px] font-extrabold text-slate-800">{label}</Text> : null}
      <TextInput
        className={`rounded-xl border border-slate-300 bg-white px-3 text-[14px] text-slate-900 ${isMultiline ? 'min-h-[110px] py-2.5' : 'h-14 py-0'}`}
        placeholderTextColor="#64748b"
        style={style}
        {...props}
      />
    </View>
  );
}
