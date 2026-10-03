import { Platform, type ViewStyle } from 'react-native';

type ShadowLevel = 'sm' | 'md' | 'lg' | 'xl';

const WEB_OFFSET: Record<ShadowLevel, string> = {
  sm: '0px 2px 4px',
  md: '0px 6px 12px',
  lg: '0px 10px 20px',
  xl: '0px 14px 28px',
};

const NATIVE: Record<ShadowLevel, ViewStyle> = {
  sm: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  md: { shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  lg: { shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.16, shadowRadius: 20, elevation: 6 },
  xl: { shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 28, elevation: 10 },
};

/**
 * Sombra multiplataforma. No web usa `boxShadow` (evita o aviso de depreciação
 * de `shadow*`); no nativo usa `shadowColor`/`elevation`.
 */
export function shadow(color: string, level: ShadowLevel = 'md'): ViewStyle {
  if (Platform.OS === 'web') {
    return { boxShadow: `${WEB_OFFSET[level]} ${color}` } as ViewStyle;
  }
  return { shadowColor: color, ...NATIVE[level] };
}
