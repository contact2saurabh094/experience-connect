import type { LucideIcon } from 'lucide-react-native';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Star,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import type { Mentor } from './data';
import { colors, spacing, typography } from './theme';

export function TextLabel({
  children,
  size = typography.body,
  color = colors.text,
  weight = '400',
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: '400' | '500' | '600' | '700' | '800';
  style?: object;
  numberOfLines?: number;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ color, fontSize: size, fontWeight: weight, lineHeight: size * 1.42 }, style]}
    >
      {children}
    </Text>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  compact = false,
  circle = false,
  disabled = false,
  icon: Icon,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  compact?: boolean;
  circle?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[`button_${variant}`],
        compact && styles.buttonCompact,
        circle && styles.buttonCircle,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      {Icon ? <Icon size={16} color={variant === 'primary' ? colors.white : colors.blue} /> : null}
      {!circle ? (
        <TextLabel
          size={compact ? typography.caption : typography.body}
          color={variant === 'primary' || variant === 'danger' ? colors.white : colors.blue}
          weight="700"
        >
          {label}
        </TextLabel>
      ) : null}
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  onBack,
  right,
  onRight,
}: {
  title: string;
  onBack: () => void;
  right?: string;
  onRight?: () => void;
}) {
  return (
    <View style={styles.screenHeader}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.headerBack}>
        <ArrowLeft size={20} color={colors.text} />
      </Pressable>
      <TextLabel size={16} weight="700" style={styles.headerTitle} numberOfLines={1}>{title}</TextLabel>
      {right && onRight ? (
        <Pressable accessibilityRole="button" onPress={onRight} hitSlop={10}>
          <TextLabel size={12} color={colors.blue} weight="700">{right}</TextLabel>
        </Pressable>
      ) : <View style={styles.headerRightSpace} />}
    </View>
  );
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionTitle}>
      <TextLabel size={17} weight="700">{title}</TextLabel>
      {action && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <TextLabel size={12} color={colors.blue} weight="600">{action}</TextLabel>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({
  label,
  selected = false,
  onPress,
  icon: Icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {Icon ? <Icon size={13} color={selected ? colors.blue : colors.secondary} /> : null}
      <TextLabel size={12} color={selected ? colors.blue : colors.secondary} weight={selected ? '600' : '500'}>
        {label}
      </TextLabel>
      {selected ? <Check size={12} color={colors.blue} /> : null}
    </Pressable>
  );
}

export function Avatar({ mentor, size = 48 }: { mentor: Mentor; size?: number }) {
  const { skin, hair, shirt, color } = mentor;
  const height = size * 1.15;
  return (
    <View style={[styles.avatar, { width: size, height, borderRadius: size * 0.24, backgroundColor: color }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 115">
        <Rect x="0" y="0" width="100" height="115" rx="18" fill={color} />
        <Circle cx="12" cy="16" r="11" fill="#FFFFFF" opacity="0.24" />
        <Circle cx="87" cy="25" r="17" fill="#FFFFFF" opacity="0.2" />
        <Path d="M12 115 Q16 77 50 78 Q84 77 88 115Z" fill={shirt} />
        <Path d="M41 69 L59 69 L62 88 Q50 97 38 88Z" fill={skin} />
        <Ellipse cx="50" cy="48" rx="25" ry="30" fill={skin} />
        <Path d="M25 44 Q22 10 49 10 Q81 10 77 48 L71 39 Q66 28 59 25 Q46 35 29 33Z" fill={hair} />
        <Path d="M26 49 Q20 26 31 19 L32 48Z" fill={hair} />
        <Ellipse cx="40" cy="50" rx="2.1" ry="2.5" fill="#302B2B" />
        <Ellipse cx="60" cy="50" rx="2.1" ry="2.5" fill="#302B2B" />
        <Path d="M44 63 Q50 67 56 63" fill="none" stroke="#824F45" strokeWidth="2" strokeLinecap="round" />
        <Path d="M35 43 Q40 40 44 43 M56 43 Q61 40 65 43" fill="none" stroke={hair} strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M38 91 L50 102 L62 91" fill="#FFFFFF" opacity="0.94" />
      </Svg>
    </View>
  );
}

export function Portrait({ mentor, height = 180 }: { mentor: Mentor; height?: number }) {
  return (
    <View accessibilityLabel={`${mentor.name}'s profile portrait`} style={[styles.portrait, { height, backgroundColor: mentor.color }]}>
      <Svg width="100%" height="100%" viewBox="0 0 390 190">
        <Rect x="0" y="0" width="390" height="190" fill={mentor.color} />
        <Circle cx="46" cy="34" r="28" fill="#FFFFFF" opacity="0.27" />
        <Circle cx="327" cy="62" r="48" fill="#FFFFFF" opacity="0.25" />
        <Path d="M35 190 Q46 111 146 111 Q241 109 260 190Z" fill={mentor.shirt} />
        <Path d="M157 102 L199 102 L204 134 Q181 148 154 132Z" fill={mentor.skin} />
        <Ellipse cx="178" cy="74" rx="43" ry="51" fill={mentor.skin} />
        <Path d="M134 67 Q128 8 176 7 Q229 6 224 70 L212 47 Q205 25 194 24 Q175 42 141 37Z" fill={mentor.hair} />
        <Path d="M137 79 Q125 40 143 22 L148 58Z" fill={mentor.hair} />
        <Ellipse cx="162" cy="76" rx="3" ry="3.5" fill="#302B2B" />
        <Ellipse cx="194" cy="76" rx="3" ry="3.5" fill="#302B2B" />
        <Path d="M166 94 Q178 103 190 94" fill="none" stroke="#824F45" strokeWidth="3" strokeLinecap="round" />
        <Path d="M153 63 Q162 58 168 63 M188 63 Q195 58 203 63" fill="none" stroke={mentor.hair} strokeWidth="3.5" strokeLinecap="round" />
        <Circle cx="324" cy="156" r="18" fill="#FFFFFF" opacity="0.36" />
      </Svg>
    </View>
  );
}

export function Rating({ value, reviews }: { value: number; reviews?: number }) {
  return (
    <View style={styles.rating}>
      <Star size={13} color={colors.orange} fill={colors.orange} />
      <TextLabel size={12} weight="700">{value.toFixed(1)}</TextLabel>
      {reviews !== undefined ? <TextLabel size={11} color={colors.secondary}>({reviews} reviews)</TextLabel> : null}
    </View>
  );
}

export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  multiline = false,
  error,
}: {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  multiline?: boolean;
  error?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      {label ? <TextLabel size={12} weight="600" style={styles.fieldLabel}>{label}</TextLabel> : null}
      <TextInput
        accessibilityLabel={label ?? placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.inputMultiline, error ? styles.inputError : null]}
      />
      {error ? <TextLabel size={11} color={colors.red}>{error}</TextLabel> : null}
    </View>
  );
}

export function BottomTab({
  label,
  Icon,
  active,
  onPress,
}: {
  label: string;
  Icon: LucideIcon;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.tab}
    >
      <Icon size={19} color={active ? colors.blue : colors.secondary} strokeWidth={active ? 2.4 : 1.8} />
      <TextLabel size={10} color={active ? colors.blue : colors.secondary} weight={active ? '700' : '500'}>
        {label}
      </TextLabel>
    </Pressable>
  );
}

export function ListRow({
  title,
  subtitle,
  onPress,
  accessory,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  accessory?: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={styles.listRow}
    >
      {Icon ? <View style={styles.listIcon}><Icon size={17} color={colors.blue} /></View> : null}
      <View style={styles.listText}>
        <TextLabel size={13} weight="600">{title}</TextLabel>
        {subtitle ? <TextLabel size={11} color={colors.secondary}>{subtitle}</TextLabel> : null}
      </View>
      {accessory ?? (onPress ? <ChevronRight size={16} color={colors.muted} /> : null)}
    </Pressable>
  );
}

export function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.backLink}>
      <ArrowLeft size={15} color={colors.blue} />
      <TextLabel size={12} color={colors.blue} weight="600">{label}</TextLabel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  button_primary: { backgroundColor: colors.blue },
  button_secondary: { backgroundColor: colors.paleBlue, borderWidth: 1, borderColor: '#D5E4FF' },
  button_ghost: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  button_danger: { backgroundColor: colors.red },
  buttonCompact: { minHeight: 38, borderRadius: 11, paddingHorizontal: 13 },
  buttonCircle: { width: 46, height: 46, minHeight: 46, borderRadius: 24, paddingHorizontal: 0 },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  screenHeader: {
    height: 54,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.page,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBack: { width: 30, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', paddingHorizontal: 8 },
  headerRightSpace: { width: 30 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  card: { backgroundColor: colors.white, borderRadius: 17, borderWidth: 1, borderColor: colors.border, padding: 15 },
  chip: {
    minHeight: 35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  chipSelected: { borderColor: '#BFD5FF', backgroundColor: colors.paleBlue },
  avatar: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  portrait: { width: '100%', overflow: 'hidden', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fieldWrap: { gap: 6, marginBottom: 14 },
  fieldLabel: { marginLeft: 2 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: 13,
    fontSize: 14,
  },
  inputMultiline: { minHeight: 96, paddingTop: 12 },
  inputError: { borderColor: colors.red },
  fieldError: { color: colors.red },
  tab: { width: 61, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 3 },
  listRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 11 },
  listIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center' },
  listText: { flex: 1, gap: 2 },
  backLink: { minHeight: 38, flexDirection: 'row', gap: 7, alignItems: 'center' },
});
