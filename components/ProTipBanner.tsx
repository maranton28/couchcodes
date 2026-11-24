import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CheatCategory } from '../types/cheats';

const CATEGORY_TIPS: Record<'ALL' | CheatCategory, { title: string; tip: string }> = {
  ALL: {
    title: 'GTA VI Code Pattern',
    tip: 'Codes share category prefixes—once you learn a prefix, entering new codes takes half the time.',
  },
  PLAYER: {
    title: 'Story Gate Reminder',
    tip: 'Most Player codes require completing the 91-mission story campaign first. Activating any code disables saving.',
  },
  ENVIRONMENT: {
    title: 'Quick Weather Loop',
    tip: 'Cycle Weather uses a repeating 3-step loop: ↓ → ↑  ↓ → ↑ →. Tap it twice to skip storms.',
  },
  COMBAT: {
    title: 'Combat Prefix Pattern',
    tip: 'Ammo codes always start with  ↓ ↑ → ↓ ← ← ↑  •  Force/Impact codes start with  ↓ ↑ ← ← → ↓',
  },
  VEHICLES: {
    title: 'Vehicle Spawn Prefix',
    tip: 'Every vehicle spawn code starts with the exact same 5-arrow opener:  ← ↑ → ↓ ←',
  },
  FILTERS: {
    title: 'Screen Filter Prefix',
    tip: 'All screen filter codes share an 8-arrow opener:  ↓ ↓ ↑ → → ↑ ← ←  (only the last 2 arrows change).',
  },
};

interface Props {
  selectedCategory: 'ALL' | CheatCategory;
}

export const ProTipBanner: React.FC<Props> = ({ selectedCategory }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const content = CATEGORY_TIPS[selectedCategory];

  return (
    <View style={styles.banner}>
      <Ionicons name="bulb" size={18} color="#FBBF24" style={{ marginTop: 2 }} />
      <View style={styles.textWrap}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.tip}>{content.tip}</Text>
      </View>
      <TouchableOpacity onPress={() => setDismissed(true)} hitSlop={10}>
        <Ionicons name="close" size={18} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1E293B',
    borderColor: '#FBBF2444',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 10,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tip: {
    color: '#E2E8F0',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
});