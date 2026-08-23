import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  TextInput,
  TextInputProps,
  StyleProp,
} from 'react-native';
import { themes } from '../theme/colors';

// Font configuration
// We use system fonts for a native feel, but styled to emulate Geist and Geist Mono.
const sansFamily = Platform.select({ ios: 'System', android: 'sans-serif' });
const monoFamily = Platform.select({ ios: 'Menlo', android: 'monospace' });

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? themes.dark : themes.light;
}

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
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
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
        <ActivityIndicator 
          size="small" 
          color={secondary ? theme.text : theme.primaryText} 
          style={{ marginRight: 8 }} 
        />
      )}
      <GeistText style={[finalTextStyle, textStyle]} weight="500">
        {title}
      </GeistText>
    </TouchableOpacity>
  );
}

export function StatusBadge({ status }: { status: 'Ready' | 'Building' | 'Failed' | 'Queued' | 'Installing' }) {
  const theme = useTheme();
  
  let color = theme.textSecondary;
  let bg = theme.surface;
  
  if (status === 'Ready') {
    color = theme.success;
    bg = theme.success + '26'; // approx 15% opacity
  } else if (status === 'Building' || status === 'Installing' || status === 'Queued') {
    color = '#F5A623'; // Amber as specified
    bg = '#F5A62326';
  } else if (status === 'Failed') {
    color = theme.error;
    bg = theme.error + '26';
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: bg,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          marginRight: 6,
        }}
      />
      <GeistText style={{ color: color, fontSize: 12, fontWeight: '500' }}>
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
