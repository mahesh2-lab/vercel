import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { GeistText, GeistCard, useTheme, GeistRow } from '../../components/GeistUI';
import { CreditCard } from 'lucide-react-native';

export default function AccountBillingScreen() {
  const theme = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>Billing</GeistText>
        <GeistText secondary style={{ marginTop: 4 }}>Manage your plan and invoices.</GeistText>
      </View>

      <GeistCard style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <CreditCard color={theme.text} size={20} style={{ marginRight: 12 }} />
          <GeistText weight="600" style={{ fontSize: 18 }}>Pro Plan</GeistText>
        </View>
        <GeistText secondary style={{ marginBottom: 16 }}>You are currently on the Pro plan, billed monthly.</GeistText>
        <GeistText weight="bold" style={{ fontSize: 24 }}>$20.00 <GeistText secondary style={{ fontSize: 14 }}>/mo</GeistText></GeistText>
      </GeistCard>

      <GeistText weight="600" style={{ marginBottom: 12 }}>Recent Invoices</GeistText>
      <GeistCard style={{ padding: 0, overflow: 'hidden' }}>
        <View style={{ paddingHorizontal: 16 }}>
          <GeistRow label="August 2026" description="Paid" value="$20.00" chevron />
          <GeistRow label="July 2026" description="Paid" value="$20.00" chevron />
          <GeistRow label="June 2026" description="Paid" value="$20.00" chevron />
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
