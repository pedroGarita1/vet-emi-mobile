import { ActivityIndicator, Pressable, StyleProp, Text, ViewStyle } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({ label, onPress, disabled, loading, style }: Props) {
  return (
    <Pressable
      className={`h-12 items-center justify-center rounded-xl border border-[#342d49] bg-[#252332] ${disabled ? 'opacity-60' : ''}`}
      style={style}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-[14px] font-extrabold text-white">{label}</Text>}
    </Pressable>
  );
}

