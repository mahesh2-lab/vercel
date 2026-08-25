import React, { useState } from 'react';
import { View, TextInput, ScrollView } from 'react-native';
import { GeistText, useTheme } from '../../components/GeistUI';
import { Search as SearchIcon } from 'lucide-react-native';
import { styles } from "../../styles/(tabs)/search.styles";

export default function SearchScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <GeistText weight="bold" style={{ fontSize: 24, marginBottom: 16 }}>
          Search
        </GeistText>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <SearchIcon size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search projects, deployments..."
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>
      </View>
      
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', marginTop: 40 }}>
        <SearchIcon size={40} color={theme.textSecondary} style={{ marginBottom: 16, opacity: 0.5 }} />
        <GeistText secondary style={{ textAlign: 'center', fontSize: 14 }}>
          {query ? `No results found for "${query}"` : 'Find anything across your Vercel teams.'}
        </GeistText>
      </ScrollView>
    </View>
  );
}


