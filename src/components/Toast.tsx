import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Check, Info, AlertTriangle } from 'lucide-react-native';
import { useTheme } from './GeistUI';

export type ToastType = 'success' | 'info' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = 'success',
  visible,
  onDismiss,
  duration = 2500,
}: ToastProps) {
  const theme = useTheme();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  const IconComponent =
    type === 'success' ? Check : type === 'error' ? AlertTriangle : Info;
  const iconColor =
    type === 'success'
      ? theme.success
      : type === 'error'
      ? theme.error
      : theme.info;

  return (
    <View style={styles.toastWrapper} pointerEvents="box-none">
      <Animated.View
        entering={FadeInUp.duration(200)}
        exiting={FadeOutUp.duration(200)}
        style={[
          styles.toastCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          },
        ]}
      >
        <IconComponent size={16} color={iconColor} style={{ marginRight: 10 }} />
        <Text style={[styles.toastText, { color: theme.text }]}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 54,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 400,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
