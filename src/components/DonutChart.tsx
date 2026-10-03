import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { useTheme } from '@/context/ThemeContext';
import { formatCurrency } from '@/utils/format';

import { AppText } from './ui/AppText';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  /** Texto centralizado (ex.: total de gastos). */
  centerLabel?: string;
  centerValue?: string;
}

const GAP_DEGREES = 2; // espaço entre fatias (apenas quando há mais de uma)

/** Gráfico de rosca para distribuição de gastos por categoria. */
export function DonutChart({
  data,
  size = 200,
  thickness = 26,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const { colors } = useTheme();
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const gapLength = total > 0 && data.length > 1 ? (GAP_DEGREES / 360) * circumference : 0;

  let cumulative = 0;
  const slices = data.map((slice) => {
    const fraction = total > 0 ? slice.value / total : 0;
    const rawLength = fraction * circumference;
    const length = Math.max(rawLength - gapLength, rawLength > 0 ? 2 : 0);
    const offset = cumulative;
    cumulative += rawLength;
    return { ...slice, length, offset };
  });

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.surface}
            strokeWidth={thickness}
            fill="none"
          />
          {slices.map((slice) => (
            <Circle
              key={slice.label}
              cx={center}
              cy={center}
              r={radius}
              stroke={slice.color}
              strokeWidth={thickness}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${slice.length} ${Math.max(circumference - slice.length, 0)}`}
              strokeDashoffset={-slice.offset}
            />
          ))}
        </G>
      </Svg>

      <View style={styles.centerContent} pointerEvents="none">
        {centerLabel ? (
          <AppText variant="caption" center>
            {centerLabel}
          </AppText>
        ) : null}
        {centerValue ? (
          <AppText variant="subtitle" center>
            {centerValue}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

/** Legenda do gráfico de rosca, ordenada por valor. */
export function DonutLegend({ data }: { data: DonutSlice[] }) {
  const { colors } = useTheme();
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  if (data.length === 0) return null;

  return (
    <View style={styles.legend}>
      {data.map((slice) => (
        <View key={slice.label} style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: slice.color }]} />
          <AppText variant="body" style={styles.legendLabel} numberOfLines={1}>
            {slice.label}
          </AppText>
          <View style={[styles.percentPill, { backgroundColor: `${slice.color}22` }]}>
            <AppText variant="caption" color={slice.color}>
              {total > 0 ? `${Math.round((slice.value / total) * 100)}%` : '0%'}
            </AppText>
          </View>
          <AppText variant="amount" color={colors.text} style={styles.legendValue}>
            {formatCurrency(slice.value)}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 44,
  },
  legend: { gap: 10, marginTop: 8 },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1 },
  percentPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  legendValue: { minWidth: 84, textAlign: 'right' },
});
