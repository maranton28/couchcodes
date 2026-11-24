import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const ProUpgradeModal: React.FC = () => {
  const { proModalReason, closeProModal, unlockPro } = useApp();

  return (
    <Modal visible={!!proModalReason} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.badge}>ONE-TIME UPGRADE</Text>
            <TouchableOpacity onPress={closeProModal} hitSlop={10}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>CouchCodes Pro — $1.99</Text>
          <Text style={styles.subtitle}>{proModalReason}</Text>

          <View style={styles.perks}>
            {[
              'All 61 GTA VI codes (Combat, Vehicles & Filters)',
              'Hands-free Couch Mode Voice Readout',
              'Up to 6 pinned favorites in your Chaos Bar',
              'Zero subscriptions & zero ads forever',
            ].map((perk) => (
              <View key={perk} style={styles.perkRow}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.buyBtn} onPress={unlockPro}>
            <Text style={styles.buyBtnText}>Unlock Forever — $1.99</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={unlockPro} style={styles.restoreBtn}>
            <Text style={styles.restoreText}>Restore Purchase</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const BriefingModal: React.FC = () => {
  const { userState, dismissBriefing } = useApp();

  return (
    <Modal visible={!userState.hasSeenBriefing} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.badge}>QUICK START</Text>
          <Text style={styles.title}>Controller Reference Guide</Text>
          <Text style={styles.subtitle}>
            Enter these D-pad sequences directly on your PS5 or Xbox controller while playing:
          </Text>

          <View style={styles.perks}>
            <Text style={styles.perkText}>• Press D-Pad Up to open your in-game phone</Text>
            <Text style={styles.perkText}>• Hold L1 + R1 (or LB + RB) before entering arrows</Text>
            <Text style={styles.perkText}>• GTA VI cheats require beating the story & completing each challenge first</Text>
          </View>

          <TouchableOpacity style={styles.buyBtn} onPress={dismissBriefing}>
            <Text style={styles.buyBtnText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  sheet: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { color: '#38BDF8', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#CBD5E1', fontSize: 14, marginTop: 6, lineHeight: 20 },
  perks: { marginVertical: 18, gap: 10 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perkText: { color: '#E2E8F0', fontSize: 14, flex: 1 },
  buyBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  restoreBtn: { marginTop: 14, alignItems: 'center' },
  restoreText: { color: '#94A3B8', fontSize: 13 },
});