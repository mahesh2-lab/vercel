import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { GeistText, useTheme } from '../../components/GeistUI';
import { useRouter } from 'expo-router';
import { Edit2 } from 'lucide-react-native';
import { useUserContext } from '../../context/UserContext';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useUserContext();

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const activeDisplayName = displayName !== null ? displayName : (user?.name || user?.username || '');
  const activeEmail = email !== null ? email : (user?.email || '');
  const initial = (activeDisplayName.trim()[0] || user?.username?.[0] || 'V').toUpperCase();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => router.replace('/auth') },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Account', 'Are you sure you want to permanently delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive' },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24, marginBottom: 4 }}>Profile Settings</GeistText>
        <GeistText secondary>Manage your account settings and personal information.</GeistText>
      </View>

      <View style={styles.grid}>
        <View style={styles.content}>
          <View style={[styles.avatarSection, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <View style={{ position: 'relative', marginRight: 24, marginBottom: Platform.OS === 'web' ? 0 : 16 }}>
              <View style={styles.avatar}>
                <GeistText weight="bold" style={{ fontSize: 32, color: '#fff' }}>{initial}</GeistText>
              </View>
              <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Edit2 size={14} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <GeistText weight="600" style={{ fontSize: 18, marginBottom: 4 }}>Avatar</GeistText>
              <GeistText secondary style={{ marginBottom: 4 }}>This is your avatar. Click on the edit icon to upload a custom one from your files.</GeistText>
              <GeistText secondary style={{ fontSize: 13, opacity: 0.7 }}>An avatar is optional but strongly recommended.</GeistText>
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.formCard, { borderColor: theme.border }]}>
              <View style={{ padding: 24, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <GeistText weight="600" style={{ fontSize: 18, marginBottom: 4 }}>Display Name</GeistText>
                <GeistText secondary style={{ marginBottom: 16 }}>Please enter your full name, or a display name you are comfortable with.</GeistText>
                <TextInput 
                  value={activeDisplayName}
                  onChangeText={setDisplayName}
                  placeholder="Your display name"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                />
              </View>
              <View style={[styles.formFooter, { backgroundColor: theme.surface }]}>
                <GeistText secondary style={{ fontSize: 13 }}>Please use 32 characters at maximum.</GeistText>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.text }]}>
                  <GeistText weight="500" style={{ color: theme.background }}>Save</GeistText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.formCard, { borderColor: theme.border, marginTop: 24 }]}>
              <View style={{ padding: 24, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <GeistText weight="600" style={{ fontSize: 18, marginBottom: 4 }}>Email Address</GeistText>
                <GeistText secondary style={{ marginBottom: 16 }}>Please enter the email address you want to use to log in with Vercel.</GeistText>
                <TextInput 
                  value={activeEmail}
                  onChangeText={setEmail}
                  placeholder="your.email@example.com"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  autoCapitalize="none"
                />
              </View>
              <View style={[styles.formFooter, { backgroundColor: theme.surface }]}>
                <GeistText secondary style={{ fontSize: 13 }}>We will email you to verify the change.</GeistText>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.text }]}>
                  <GeistText weight="500" style={{ color: theme.background }}>Save</GeistText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 32 }]}>
            <GeistText weight="600" style={{ color: theme.error, fontSize: 18, marginBottom: 16 }}>Danger Zone</GeistText>
            
            <View style={[styles.dangerBox, { borderColor: theme.error + '80', backgroundColor: theme.error + '0A', marginBottom: 16 }]}>
              <View style={{ flex: 1, marginRight: 16, marginBottom: Platform.OS === 'web' ? 0 : 16 }}>
                <GeistText weight="500" style={{ fontSize: 16, marginBottom: 4 }}>Sign Out</GeistText>
                <GeistText secondary style={{ fontSize: 14 }}>Sign out of your account on this device.</GeistText>
              </View>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={handleSignOut}
                style={[styles.dangerBtn, { backgroundColor: theme.error }]}
              >
                <GeistText weight="500" style={{ color: '#fff' }}>Sign Out</GeistText>
              </TouchableOpacity>
            </View>

            <View style={[styles.dangerBox, { borderColor: theme.error + '80', backgroundColor: theme.error + '0A' }]}>
              <View style={{ flex: 1, marginRight: 16, marginBottom: Platform.OS === 'web' ? 0 : 16 }}>
                <GeistText weight="500" style={{ fontSize: 16, marginBottom: 4 }}>Delete Account</GeistText>
                <GeistText secondary style={{ fontSize: 14 }}>Permanently delete your account and all of its contents.</GeistText>
              </View>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={handleDelete}
                style={[styles.dangerBtn, { backgroundColor: theme.error }]}
              >
                <GeistText weight="500" style={{ color: '#fff' }}>Delete Account</GeistText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'column',
    gap: 32,
  },
  content: {
    flex: 1,
    gap: 32,
  },
  avatarSection: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    padding: 24,
    borderWidth: 1,
    borderRadius: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0070F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    marginBottom: 0,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    maxWidth: 400,
  },
  formFooter: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dangerBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    justifyContent: 'space-between',
  },
  dangerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignSelf: Platform.OS === 'web' ? 'center' : 'flex-start',
  }
});
