import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CheatEntry, DPadDirection } from '../types/cheats';

const ARROW_SYMBOLS: Record<DPadDirection, string> = {
  UP: '↑',
  DOWN: '↓',
  LEFT: '←',
  RIGHT: '→',
};

interface Props {
  cheat: CheatEntry;
  isUnlocked: boolean;
  isFavorite: boolean;
  isProUser: boolean;
  onPress: () => void;
  onToggleUnlock: () => void;
  onToggleFavorite: () => void;
}

export const CheatCard: React.FC<Props> = ({
  cheat,
  isUnlocked,
  isFavorite,
  isProUser,
  onPress,
  onToggleUnlock,
  onToggleFavorite,
}) => {
  const isLockedByPaywall = !cheat.isFreeTier && !isProUser;
  const isUnconfirmed = cheat.status === 'UNCONFIRMED';

  return (
    <TouchableOpacity
      style={[styles.card, isLockedByPaywall && styles.cardLocked]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{cheat.title}</Text>
          {isLockedByPaywall && (
            <View style={styles.proBadge}>
              <Ionicons name="lock-closed" size={11} color="#0F172A" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
          {isUnconfirmed && (
            <View style={styles.tbaBadge}>
              <Text style={styles.tbaBadgeText}>TBA</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onToggleFavorite} hitSlop={10}>
            <Ionicons
              name={isFavorite ? 'star' : 'star-outline'}
              size={22}
              color={isFavorite ? '#FBBF24' : '#64748B'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggleUnlock} hitSlop={10} style={{ marginLeft: 14 }}>
            <Ionicons
              name={isUnlocked ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={isUnlocked ? '#22C55E' : '#64748B'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.reqText}>Unlock: {cheat.unlockRequirement.summary}</Text>

      <View style={styles.sequencePreview}>
        {isUnconfirmed ? (
          <Text style={styles.unconfirmedText}>Awaiting community verification</Text>
        ) : isLockedByPaywall ? (
          <Text style={styles.lockedHint}>Tap to unlock full {cheat.category.toLowerCase()} pack</Text>
        ) : (
          <Text style={styles.arrows}>
            {cheat.sequence.map((dir) => ARROW_SYMBOLS[dir]).join('  ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardLocked: {
    opacity: 0.85,
    borderColor: '#475569',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  proBadgeText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '800',
  },
  tbaBadge: {
    backgroundColor: '#F59E0B33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tbaBadgeText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reqText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
  },
  sequencePreview: {
    marginTop: 12,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  arrows: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  unconfirmedText: {
    color: '#FBBF24',
    fontSize: 13,
    fontStyle: 'italic',
  },
  lockedHint: {
    color: '#94A3B8',
    fontSize: 13,
  },
});