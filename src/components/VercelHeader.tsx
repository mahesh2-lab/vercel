import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { GeistText, useTheme } from './GeistUI';
import { ChevronDown } from 'lucide-react-native';

export function VercelHeader() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <View style={styles.content}>
        
        {/* Left Side: Vercel Logo */}
        <TouchableOpacity style={styles.logoContainer} activeOpacity={0.7}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L24 22H0L12 2Z" fill={theme.text} />
          </Svg>
        </TouchableOpacity>

        {/* Middle: Context Switcher */}
        <TouchableOpacity style={styles.contextSwitcher} activeOpacity={0.7}>
          <GeistText weight="500" style={{ fontSize: 16 }}>maheshchopade</GeistText>
          <ChevronDown color={theme.textSecondary} size={16} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {/* Right Side: Avatar */}
        <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.7}>
          <View style={[styles.avatar, { borderColor: theme.border }]}>
            <GeistText weight="bold" style={{ fontSize: 12 }}>M</GeistText>
          </View>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    height: 56, // Standard mobile header height
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  contextSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
