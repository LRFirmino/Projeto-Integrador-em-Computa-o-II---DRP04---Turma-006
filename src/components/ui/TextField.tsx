import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, spacing } from '@/theme';

import { AppText } from './AppText';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Versão grande usada para o valor no lançamento rápido. */
  large?: boolean;
  /** Prefixo fixo exibido dentro do campo (ex.: "R$"). */
  prefix?: string;
  /** Ícone à esquerda. */
  icon?: keyof typeof Ionicons.glyphMap;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, large, prefix, icon, style, onFocus, onBlur, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderWidth: focused || error ? 1.5 : StyleSheet.hairlineWidth,
          },
          large && styles.largeContainer,
        ]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.textMuted} /> : null}
        {prefix ? (
          <AppText variant={large ? 'heading' : 'body'} color={colors.textMuted}>
            {prefix}
          </AppText>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, large && styles.large, { color: colors.text }, style]}
        />
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { marginLeft: spacing.xs },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 54,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  largeContainer: {
    minHeight: 72,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
  },
  large: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'left',
    paddingVertical: 0,
  },
});
