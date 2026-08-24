import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Platform,
  ViewStyle,
  TextStyle,
  TextInput,
  TextInputProps,
  StyleProp,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { themes } from '../theme/colors';

// Font configuration
// We use system fonts for a native feel, but styled to emulate Geist and Geist Mono.
const sansFamily = Platform.select({ ios: 'System', android: 'sans-serif' });
const monoFamily = Platform.select({ ios: 'Menlo', android: 'monospace' });

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? themes.dark : themes.light;
}

export function GeistSpinner({
  size = 20,
  color,
}: {
  size?: number | 'small' | 'default' | 'large';
  color?: string;
}) {
  const theme = useTheme();
  const spinValue = React.useRef(new Animated.Value(0)).current;

  const actualSize =
    typeof size === 'number'
      ? size
      : size === 'small'
      ? 16
      : size === 'large'
      ? 28
      : 20;

  const actualColor = color || theme.text;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 850,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bars = [
    { opacity: 0.15, transform: 'rotate(0 12 12)' },
    { opacity: 0.2, transform: 'rotate(30 12 12)' },
    { opacity: 0.25, transform: 'rotate(60 12 12)' },
    { opacity: 0.3, transform: 'rotate(90 12 12)' },
    { opacity: 0.38, transform: 'rotate(120 12 12)' },
    { opacity: 0.46, transform: 'rotate(150 12 12)' },
    { opacity: 0.55, transform: 'rotate(180 12 12)' },
    { opacity: 0.65, transform: 'rotate(210 12 12)' },
    { opacity: 0.75, transform: 'rotate(240 12 12)' },
    { opacity: 0.85, transform: 'rotate(270 12 12)' },
    { opacity: 0.93, transform: 'rotate(300 12 12)' },
    { opacity: 1.0, transform: 'rotate(330 12 12)' },
  ];

  return (
    <View
      style={{
        width: actualSize,
        height: actualSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={{
          width: actualSize,
          height: actualSize,
          transform: [{ rotate: spin }],
        }}
      >
        <Svg width={actualSize} height={actualSize} viewBox="0 0 24 24">
          {bars.map((bar, i) => (
            <Rect
              key={i}
              x="11"
              y="1.5"
              width="2"
              height="5.5"
              rx="1"
              fill={actualColor}
              opacity={bar.opacity}
              transform={bar.transform}
            />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}

export const Spinner = GeistSpinner;

export function GeistText({
  children,
  style,
  mono = false,
  secondary = false,
  weight = 'normal',
  numberOfLines,
  ellipsizeMode,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  mono?: boolean;
  secondary?: boolean;
  weight?: 'normal' | '500' | '600' | 'bold';
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}) {
  const theme = useTheme();
  
  const baseStyle: TextStyle = {
    fontFamily: mono ? monoFamily : sansFamily,
    color: secondary ? theme.textSecondary : theme.text,
    fontWeight: weight === 'normal' ? '400' : weight === '500' ? '500' : weight === '600' ? '600' : 'bold',
    fontSize: 14,
    letterSpacing: mono ? 0 : -0.2, // Tighter letter spacing for sans
  };

  return (
    <Text
      style={[baseStyle, style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
      {children}
    </Text>
  );
}

export function GeistCard({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
}) {
  const theme = useTheme();
  const cardStyle: ViewStyle = {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

export function GeistButton({
  title,
  onPress,
  secondary = false,
  loading = false,
  style,
  textStyle,
  prefix,
  suffix,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  const theme = useTheme();
  
  const containerStyle: ViewStyle = {
    backgroundColor: secondary ? theme.background : theme.primary,
    borderColor: secondary ? theme.border : theme.primary,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    opacity: loading ? 0.7 : 1,
  };
  
  const finalTextStyle: TextStyle = {
    color: secondary ? theme.text : theme.primaryText,
    fontWeight: '500',
    fontSize: 14,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={loading}
      style={[containerStyle, style]}
    >
      {loading && (
        <View style={{ marginRight: 8 }}>
          <GeistSpinner 
            size={16} 
            color={secondary ? theme.text : theme.primaryText} 
          />
        </View>
      )}
      {!loading && prefix && (
        <View style={{ marginRight: 8 }}>{prefix}</View>
      )}
      <GeistText style={[finalTextStyle, textStyle]} weight="500">
        {title}
      </GeistText>
      {!loading && suffix && (
        <View style={{ marginLeft: 8 }}>{suffix}</View>
      )}
    </TouchableOpacity>
  );
}

export function StatusBadge({ status }: { status: 'Ready' | 'Building' | 'Failed' | 'Queued' | 'Installing' | 'Canceled' }) {
  const theme = useTheme();
  
  let dotColor = theme.textSecondary;
  
  if (status === 'Ready') {
    dotColor = theme.text; // Clean, neutral dot instead of blue
  } else if (status === 'Building' || status === 'Installing' || status === 'Queued') {
    dotColor = '#F5A623'; // Amber
  } else if (status === 'Failed') {
    dotColor = theme.error;
  } else if (status === 'Canceled') {
    dotColor = theme.textSecondary;
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: dotColor,
          marginRight: 6,
        }}
      />
      <GeistText style={{ color: theme.text, fontSize: 12, fontWeight: '500' }}>
        {status}
      </GeistText>
    </View>
  );
}

export function GeistRow({
  label,
  value,
  description,
  onPress,
  chevron = false,
}: {
  label: string;
  value?: string;
  description?: string;
  onPress?: () => void;
  chevron?: boolean;
}) {
  const theme = useTheme();

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        minHeight: 68,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
    >
      <View style={{ flex: 1 }}>
        <GeistText weight="500">{label}</GeistText>
        {description && (
          <GeistText secondary style={{ marginTop: 2, fontSize: 13 }}>
            {description}
          </GeistText>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {value && <GeistText secondary>{value}</GeistText>}
        {chevron && (
          <GeistText secondary style={{ marginLeft: 8 }}>
            ›
          </GeistText>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

export function GeistInput(props: TextInputProps & { mono?: boolean }) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      {...props}
      style={[
        {
          color: props.mono ? theme.textSecondary : theme.text,
          fontFamily: props.mono ? monoFamily : sansFamily,
          fontSize: 14,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.surface,
          borderRadius: 6,
        },
        props.style,
      ]}
    />
  );
}
