import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radius, spacing } from '@/theme';

import { AppText } from './ui/AppText';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({ icon = 'sparkles-outline', title, description }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={28} color={colors.textMuted} />
      </View>
      <AppText variant="subtitle" center>
        {title}
      </AppText>
      {description ? (
        <AppText variant="caption" center style={styles.description}>
          {description}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    maxWidth: 280,
    lineHeight: 18,
  },
});
