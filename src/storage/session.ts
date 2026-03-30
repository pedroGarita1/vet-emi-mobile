import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionState } from '../types';

const TOKEN_KEY = 'emi_api_token';
const USER_KEY = 'emi_user';
const SEDE_KEY = 'emi_sede';

export async function saveSession(session: SessionState): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, session.token),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(session.user)),
    AsyncStorage.setItem(SEDE_KEY, session.sede),
  ]);
}

export async function loadSession(): Promise<SessionState | null> {
  const [token, userJson, sede] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(USER_KEY),
    AsyncStorage.getItem(SEDE_KEY),
  ]);

  if (!token || !userJson) {
    return null;
  }

  try {
    return {
      token,
      user: JSON.parse(userJson) as SessionState['user'],
      sede: sede ?? 'Matriz',
    };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
    AsyncStorage.removeItem(SEDE_KEY),
  ]);
}
