import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { ChevronDown, Check, User, Users, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GeistText, useTheme } from './GeistUI';
import { useUserContext, ActiveScope, VercelTeam } from '../context/UserContext';

export function VercelHeader() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { user, teams, activeScope, setActiveScope } = useUserContext();

  const [modalVisible, setModalVisible] = useState(false);

  const displayName = activeScope?.name || user?.username || user?.name || 'Account';
  const initial = (displayName.trim()[0] || 'V').toUpperCase();

  const handleSelectScope = (scope: ActiveScope) => {
    setActiveScope(scope);
    setModalVisible(false);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: theme.background,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left Side: Vercel Logo */}
        <TouchableOpacity
          style={styles.logoContainer}
          activeOpacity={0.7}
          onPress={() => router.replace('/')}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L24 22H0L12 2Z" fill={theme.text} />
          </Svg>
        </TouchableOpacity>

        {/* Middle: Context Switcher */}
        <TouchableOpacity
          style={styles.contextSwitcher}
          activeOpacity={0.7}
          onPress={() => setModalVisible(true)}
        >
          <GeistText weight="500" style={{ fontSize: 16 }} numberOfLines={1}>
            {displayName}
          </GeistText>
          <ChevronDown color={theme.textSecondary} size={16} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {/* Right Side: Avatar */}
        <TouchableOpacity
          style={styles.avatarContainer}
          activeOpacity={0.7}
          onPress={() => router.push('/profile')}
        >
          <View style={[styles.avatar, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <GeistText weight="bold" style={{ fontSize: 12 }}>
              {initial}
            </GeistText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Scope Switcher Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                marginTop: insets.top + 48,
              },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <GeistText weight="600" style={{ fontSize: 15 }}>
                Switch Workspace
              </GeistText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {/* Personal Account */}
              {user && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    handleSelectScope({
                      id: user.id,
                      type: 'personal',
                      name: user.username || user.name,
                      slug: user.username,
                      avatar: user.avatar,
                    })
                  }
                  style={[
                    styles.scopeRow,
                    {
                      backgroundColor:
                        activeScope?.type === 'personal' ? theme.surface : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.scopeIcon}>
                    <User size={16} color={theme.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <GeistText weight="500">{user.username || user.name}</GeistText>
                    <GeistText secondary style={{ fontSize: 12 }}>
                      Personal Account
                    </GeistText>
                  </View>
                  {activeScope?.type === 'personal' && (
                    <Check size={16} color={theme.success} />
                  )}
                </TouchableOpacity>
              )}

              {/* Teams */}
              {teams.map((team: VercelTeam) => {
                const isSelected = activeScope?.id === team.id;
                return (
                  <TouchableOpacity
                    key={team.id}
                    activeOpacity={0.7}
                    onPress={() =>
                      handleSelectScope({
                        id: team.id,
                        type: 'team',
                        name: team.name,
                        slug: team.slug,
                        avatar: team.avatar,
                      })
                    }
                    style={[
                      styles.scopeRow,
                      {
                        backgroundColor: isSelected ? theme.surface : 'transparent',
                      },
                    ]}
                  >
                    <View style={styles.scopeIcon}>
                      <Users size={16} color={theme.text} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <GeistText weight="500">{team.name}</GeistText>
                      <GeistText secondary style={{ fontSize: 12 }}>
                        Team
                      </GeistText>
                    </View>
                    {isSelected && <Check size={16} color={theme.success} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    height: 56,
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
    maxWidth: 200,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  scopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  scopeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
