import { StyleSheet } from 'react-native';

export const palette = {
  bg: '#f2f0f7',
  card: '#fbfafc',
  border: '#dad6e3',
  text: '#252332',
  muted: '#6f6a80',
  primary: '#8b78b9',
  primaryDark: '#5d4a82',
  danger: '#b85b7a',
  successSoft: '#efeafb',
  shadow: 'rgba(37, 35, 50, 0.09)',
};

export const ui = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  screenPadding: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  card: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    backgroundColor: '#f6f4fa',
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: palette.text,
  },
  label: {
    color: palette.text,
    fontWeight: '700',
    marginBottom: 6,
  },
  button: {
    backgroundColor: palette.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },
});
