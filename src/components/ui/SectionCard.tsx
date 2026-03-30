import { ReactNode } from 'react';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function SectionCard({ title, subtitle, children }: Props) {
  return (
    <View className="gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <View className="flex-row items-center gap-2.5 rounded-xl border border-violet-100 bg-violet-50 px-3 py-3">
        <View className="self-stretch w-1.5 rounded-full bg-violet-600" />
        <View className="flex-1">
          <Text className="text-[18px] font-black text-slate-900">{title}</Text>
          {subtitle ? <Text className="mt-0.5 text-[12px] font-semibold text-slate-600">{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

