import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Switch } from 'react-native';
import { GeistText, GeistCard, useTheme } from '../../components/GeistUI';

export default function AccountSecurityScreen() {
  const theme = useTheme();
  const [sso, setSso] = useState(false);
  const [tfa, setTfa] = useState(true);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>Security</GeistText>
        <GeistText secondary style={{ marginTop: 4 }}>{"Manage your team's security policies."}</GeistText>
      </View>

      <GeistCard style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <GeistText weight="600">SAML Single Sign-On (SSO)</GeistText>
            <GeistText secondary style={{ marginTop: 4, fontSize: 13 }}>Require team members to authenticate via your identity provider.</GeistText>
          </View>
          <Switch value={sso} onValueChange={setSso} />
        </View>
      </GeistCard>

      <GeistCard style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <GeistText weight="600">Two-Factor Authentication</GeistText>
            <GeistText secondary style={{ marginTop: 4, fontSize: 13 }}>Require team members to use 2FA for their accounts.</GeistText>
          </View>
          <Switch value={tfa} onValueChange={setTfa} />
        </View>
      </GeistCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
});
