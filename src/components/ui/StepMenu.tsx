import { Pressable, ScrollView, Text, View } from 'react-native';

type StepItem = {
  label: string;
  percent: number;
};

type Props = {
  title?: string;
  subtitle?: string;
  steps: StepItem[];
  currentStep: number;
  onSelectStep: (step: number) => void;
};

export function StepMenu({
  title = 'Menu de pasos',
  subtitle = 'Se mantiene visible para retomar cualquier seccion.',
  steps,
  currentStep,
  onSelectStep,
}: Props) {
  return (
    <View className="rounded-xl border border-slate-300 bg-white p-3">
      <Text className="text-[19px] font-extrabold text-slate-900">{title}</Text>
      <Text className="mt-0.5 text-[13px] font-semibold text-slate-500">{subtitle}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-2 pt-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const done = step.percent >= 100;
          const active = currentStep === stepNumber;
          const boundedPercent = Math.max(0, Math.min(100, step.percent));

          return (
            <Pressable
              key={`${step.label}-${stepNumber}`}
              onPress={() => onSelectStep(stepNumber)}
              className={`min-w-[132px] rounded-xl border px-2.5 py-2 ${done ? 'border-violet-700 bg-violet-600' : active ? 'border-violet-300 bg-violet-50' : 'border-violet-200 bg-violet-50'}`}
            >
              <Text className={`text-[13px] font-extrabold ${done ? 'text-white' : active ? 'text-violet-800' : 'text-violet-900'}`}>
                {step.label}
              </Text>

              <Text className={`text-[12px] font-bold ${done ? 'text-white/95' : 'text-slate-700'}`}>
                {boundedPercent}%
              </Text>

              <View className={`mt-1 h-1.5 overflow-hidden rounded-full ${done ? 'bg-white/35' : 'bg-violet-100'}`}>
                <View
                  className={`${done ? 'bg-white' : 'bg-violet-600'}`}
                  style={{ width: `${Math.max(6, boundedPercent)}%`, height: '100%' }}
                />
              </View>

              <View className="mt-1 flex-row items-center gap-1">
                <View className={`h-5 w-5 items-center justify-center rounded-full border ${done ? 'border-white/45 bg-white/20' : 'border-slate-300 bg-white'}`}>
                  <Text className={`text-[10px] font-black ${done ? 'text-white' : 'text-slate-700'}`}>{stepNumber}</Text>
                </View>
                <Text className={`text-[11px] font-bold ${done ? 'text-white/95' : 'text-slate-500'}`}>
                  {active ? 'En progreso' : done ? 'Completado' : 'Pendiente'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
