import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './context/AppContext';
import { CheatCategory, CheatEntry } from './types/cheats';
import { CheatCard } from './components/CheatCard';
import { CouchModeModal } from './components/CouchModeModal';
import { BriefingModal, ProUpgradeModal } from './components/ProUpgradeModal';
import { ProTipBanner } from './components/ProTipBanner';

const CATEGORIES: ('ALL' | CheatCategory)[] = [
  'ALL',
  'PLAYER',
  'ENVIRONMENT',
  'COMBAT',
  'VEHICLES',
  'FILTERS',
];

const MainScreen: React.FC = () => {
  const { catalog, userState, toggleUnlocked, toggleFavorite, openProModal } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | CheatCategory>('ALL');
  const [unlockedOnly, setUnlockedOnly] = useState(false);
  const [activeCheat, setActiveCheat] = useState<CheatEntry | null>(null);

  const pinnedCheats = useMemo(
    () => catalog.cheats.filter((c) => userState.favoriteCheatIds.includes(c.id)),
    [catalog.cheats, userState.favoriteCheatIds]
  );

  const filteredCheats = useMemo(() => {
    return catalog.cheats.filter((cheat) => {
      if (selectedCategory !== 'ALL' && cheat.category !== selectedCategory) return false;
      if (unlockedOnly && !userState.unlockedCheatIds.includes(cheat.id)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          cheat.title.toLowerCase().includes(q) ||
          cheat.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [catalog.cheats, selectedCategory, unlockedOnly, search, userState.unlockedCheatIds]);

  const handleCheatPress = (cheat: CheatEntry) => {
    if (!cheat.isFreeTier && !userState.isPro) {
      openProModal(`Unlock all ${cheat.category.toLowerCase()} cheats + Couch Mode audio for $1.99.`);
      return;
    }
    setActiveCheat(cheat);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>CouchCodes</Text>
          <Text style={styles.appSub}>
            {catalog.gameTitle} • {userState.unlockedCheatIds.length}/{catalog.totalExpectedCheats} Unlocked
          </Text>
        </View>
        {!userState.isPro && (
          <TouchableOpacity
            style={styles.proPill}
            onPress={() => openProModal('Unlock all 61 cheats & voice readout forever.')}
          >
            <Text style={styles.proPillText}>PRO $1.99</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search + Unlocked Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search codes (e.g. Armor, Cash, Fire Truck)..."
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.toggleBox}>
          <Text style={styles.toggleLabel}>Usable</Text>
          <Switch
            value={unlockedOnly}
            onValueChange={setUnlockedOnly}
            trackColor={{ false: '#334155', true: '#22C55E' }}
          />
        </View>
      </View>

      {/* Pinned Chaos Bar */}
      {pinnedCheats.length > 0 && (
        <View style={styles.chaosSection}>
          <Text style={styles.sectionLabel}>PINNED CHAOS BAR</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {pinnedCheats.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.chaosChip}
                onPress={() => handleCheatPress(item)}
              >
                <Ionicons name="star" size={13} color="#FBBF24" />
                <Text style={styles.chaosChipText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category Pills */}
      <View style={{ height: 42, marginBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.catText, active && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ProTipBanner selectedCategory={selectedCategory} />

      {/* Cheat List */}
      <FlatList
        data={filteredCheats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <CheatCard
            cheat={item}
            isUnlocked={userState.unlockedCheatIds.includes(item.id)}
            isFavorite={userState.favoriteCheatIds.includes(item.id)}
            isProUser={userState.isPro}
            onPress={() => handleCheatPress(item)}
            onToggleUnlock={() => toggleUnlocked(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        ListFooterComponent={
          <Text style={styles.disclaimer}>
            Unofficial fan-made reference utility. Not affiliated with or endorsed by Rockstar Games or Take-Two Interactive.
          </Text>
        }
      />

      <CouchModeModal cheat={activeCheat} onClose={() => setActiveCheat(null)} />
      <ProUpgradeModal />
      <BriefingModal />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainScreen />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  appTitle: { color: '#F8FAFC', fontSize: 24, fontWeight: '900' },
  appSub: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  proPill: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proPillText: { color: '#0F172A', fontWeight: '800', fontSize: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#F8FAFC', fontSize: 14 },
  toggleBox: { alignItems: 'center' },
  toggleLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700', marginBottom: 2 },
  chaosSection: { marginBottom: 12 },
  sectionLabel: { color: '#64748B', fontSize: 10, fontWeight: '800', marginBottom: 6 },
  chaosChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderColor: '#FBBF2466',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  chaosChipText: { color: '#F8FAFC', fontSize: 12, fontWeight: '700' },
  catPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
  },
  catPillActive: { backgroundColor: '#38BDF8' },
  catText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  catTextActive: { color: '#0F172A' },
  disclaimer: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});