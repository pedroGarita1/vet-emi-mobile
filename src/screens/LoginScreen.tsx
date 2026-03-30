import { useState } from 'react';
import { Pressable } from 'react-native';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { SEDES } from '../config';
import { AppButton } from '../components/ui/AppButton';
import { LabeledInput } from '../components/ui/LabeledInput';
import { LabeledSelect } from '../components/ui/LabeledSelect';

type Props = {
  email: string;
  password: string;
  sede: string;
  loading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSedeChange: (value: string) => void;
  onSubmit: () => void;
};

export function LoginScreen({
  email,
  password,
  sede,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onSedeChange,
  onSubmit,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#f2f0f7]">
      <ScrollView contentContainerClassName="grow justify-center p-4">
        <View className="w-full max-w-[460px] self-center">
          <View className="mb-3 overflow-hidden rounded-2xl border border-[#3a334d] bg-[#252332] px-4 py-5 shadow-sm">
            <Text className="text-[12px] font-black uppercase tracking-[1.2px] text-[#cfc7e2]">Clinica veterinaria</Text>
            <View className="mt-2 flex-row items-end gap-2">
              <Text className="text-[34px] font-black text-white">Emi Vet</Text>
              <Text className="pb-1 text-[12px] font-extrabold uppercase tracking-[1px] text-[#a995cf]">Sistema</Text>
            </View>
            <Text className="mt-2 text-[30px] font-black text-[#efeafb]">Iniciar sesion</Text>
            <Text className="mt-1 text-[14px] font-semibold text-[#d9d2ea]">
              Control y trazabilidad de consultas, inventario y ventas en campo.
            </Text>
          </View>

          <View className="rounded-2xl border border-[#d4cede] bg-[#fbfafc] p-4 shadow-sm">
            <View className="gap-3">
              <Text className="text-[22px] font-black text-slate-900">Acceso de personal</Text>

              <LabeledInput
                label="Correo electronico"
                value={email}
                onChangeText={onEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="ejemplo@correo.com"
              />

              <View className="gap-1.5">
                <Text className="text-[13px] font-extrabold text-slate-800">Contrasena</Text>
                <View className="flex-row overflow-hidden rounded-xl border border-slate-300 bg-white">
                  <View className="flex-1">
                    <LabeledInput
                      label=""
                      value={password}
                      onChangeText={onPasswordChange}
                      secureTextEntry={!showPassword}
                      placeholder="Ingresa tu contrasena"
                      style={{ borderWidth: 0, paddingHorizontal: 12, height: 54 }}
                    />
                  </View>
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    className="items-center justify-center border-l border-slate-200 bg-slate-50 px-3"
                  >
                    <Text className="text-[12px] font-extrabold text-[#5d4a82]">{showPassword ? 'Ocultar' : 'Ver'}</Text>
                  </Pressable>
                </View>
              </View>

              <LabeledSelect
                label="Sede"
                selectedValue={sede}
                onValueChange={onSedeChange}
                options={SEDES.map((item) => ({ label: item, value: item }))}
                helperText="Confirma la sede para acceder al modulo correcto."
              />

              <View className="h-px bg-slate-200" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-4 w-4 rounded border border-slate-300 bg-white" />
                  <Text className="text-[13px] font-semibold text-slate-700">Recordarme</Text>
                </View>
                <Text className="text-[12px] font-bold text-[#5d4a82]">Olvide mi contrasena</Text>
              </View>

              {error ? <Text className="font-bold text-red-700">{error}</Text> : null}

              <AppButton label="Iniciar sesion" onPress={onSubmit} loading={loading} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

