import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { getSetting, setSetting as persistSetting } from '@/db';
import { darkColors, lightColors, type ThemeColors } from '@/theme';
import type { ThemePreference } from '@/types/models';

const THEME_KEY = 'theme_preference';

interface ThemeContextValue {
  /** Preferência salva pelo usuário. */
  preference: ThemePreference;
  /** Esquema efetivamente aplicado ('light' | 'dark'). */
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    getSetting(THEME_KEY)
      .then((value) => {
        if (!active || !value) return;
        if (value === 'light' || value === 'dark' || value === 'system') {
          setPreferenceState(value);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    persistSetting(THEME_KEY, next).catch(() => undefined);
  }, []);

  const scheme: 'light' | 'dark' =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      setPreference,
    }),
    [preference, scheme, setPreference],
  );

  // Evita "flash" de tema errado enquanto lê a preferência salva.
  if (!hydrated) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>.');
  return ctx;
}
