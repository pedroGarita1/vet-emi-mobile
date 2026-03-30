import { Pressable, Text, View } from 'react-native';
import { Section } from '../../types';
import { palette } from '../../styles/theme';

const tabs: Array<{ key: Section; label: string }> = [
  { key: 'inventory', label: 'Inventario' },
  { key: 'sales', label: 'POS' },
  { key: 'consultations', label: 'Consultas' },
];

type Props = {
  active: Section;
  onChange: (section: Section) => void;
};

export function TabBar({ active, onChange }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#dcebe6',
        padding: 10,
      }}
    >
      {tabs.map((tab) => {
        const selected = tab.key === active;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={{
              flex: 1,
              backgroundColor: selected ? '#eff6ff' : '#f5fbf8',
              borderRadius: 12,
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? '#2563eb' : '#d7e8e3',
              alignItems: 'center',
              paddingVertical: 9,
              gap: 4,
            }}
          >
            <Text style={{ color: selected ? '#5d4a82' : '#6f6a80', fontWeight: '800', fontSize: 13 }}>{tab.label}</Text>
            <View
              style={{
                width: '82%',
                height: 5,
                borderRadius: 999,
                backgroundColor: selected ? '#dbeafe' : '#cdeee3',
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: selected ? '100%' : '28%',
                  height: '100%',
                  backgroundColor: selected ? '#2563eb' : palette.primary,
                }}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
