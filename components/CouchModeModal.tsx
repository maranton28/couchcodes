import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { CheatEntry, DPadDirection } from '../types/cheats';
import { useApp } from '../context/AppContext';

const ICON_MAP: Record<DPadDirection, keyof typeof Ionicons.glyphMap> = {
  UP: 'arrow-up',
  DOWN: 'arrow-down',
  LEFT: 'arrow-back',
  RIGHT: 'arrow-forward',
};

interface Props {
  cheat: CheatEntry | null;
  onClose: () => void;
}

export const CouchModeModal: React.FC<Props> = ({ cheat, onClose }) => {
  const { userState, toggleUnlocked, setConsole, setSpeechRate, openProModal } = useApp();
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAudio = () => {
    Speech.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsSpeaking(false);
    setActiveIndex(-1);
  };

  useEffect(() => {
    return () => stopAudio();
  }, [cheat]);

  if (!cheat) return null;

  const isUnlocked = userState.unlockedCheatIds.includes(cheat.id);
  const triggerCombo = userState.selectedConsole === 'PS5' ? 'Hold L1 + R1' : 'Hold LB + RB';

  const handleReadAloud = () => {
    if (!userState.isPro) {
      openProModal('Unlock hands-free Voice Readout in Couch Mode for $1.99.');
      return;
    }
    if (isSpeaking) {
      stopAudio();
      return;
    }
    if (cheat.sequence.length === 0) return;

    setIsSpeaking(true);
    let idx = 0;

    const speakStep = (stepIdx: number) => {
      setActiveIndex(stepIdx);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Speech.speak(cheat.sequence[stepIdx].toLowerCase(), {
        rate: userState.speechRate,
      });
    };

    speakStep(0);
    const intervalMs = Math.round(950 / userState.speechRate);

    timerRef.current = setInterval(() => {
      idx += 1;
      if (idx >= cheat.sequence.length) {
        stopAudio();
      } else {
        speakStep(idx);
      }
    }, intervalMs);
  };

  const cycleSpeed = () => {
    const next = userState.speechRate === 0.85 ? 1.1 : userState.speechRate === 1.1 ? 0.65 : 0.85;
    setSpeechRate(next);
  };

  return (
    <Modal visible={!!cheat} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        {/* Top Bar */}
        <View style={styles.header}>
          <View style={styles.consoleSwitch}>
            {(['PS5', 'XBOX'] as const).map((plat) => (
              <TouchableOpacity
                key={plat}
                onPress={() => setConsole(plat)}
                style={[
                  styles.consoleBtn,
                  userState.selectedConsole === plat && styles.consoleBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.consoleText,
                    userState.selectedConsole === plat && styles.consoleTextActive,
                  ]}
                >
                  {plat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => {
              stopAudio();
              onClose();
            }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={28} color="#F8FAFC" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{cheat.title}</Text>
        <Text style={styles.description}>{cheat.description}</Text>

        {/* Activation Step Banner */}
        <View style={styles.activationBanner}>
          <Text style={styles.activationText}>
            1. D-Pad UP (Open Phone)   →   2. {triggerCombo}   →   3. Enter Sequence
          </Text>
        </View>

        {/* Oversized D-Pad Grid */}
        <View style={styles.grid}>
          {cheat.sequence.length === 0 ? (
            <Text style={styles.pendingText}>
              Sequence awaiting community verification. Check back soon via OTA sync.
            </Text>
          ) : (
            cheat.sequence.map((dir, i) => {
              const highlighted = activeIndex === i;
              return (
                <View
                  key={`${dir}-${i}`}
                  style={[styles.arrowBox, highlighted && styles.arrowBoxActive]}
                >
                  <Ionicons
                    name={ICON_MAP[dir]}
                    size={38}
                    color={highlighted ? '#0F172A' : '#38BDF8'}
                  />
                  <Text style={[styles.stepNum, highlighted && { color: '#0F172A' }]}>
                    {i + 1}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* Voice Controls */}
        {cheat.sequence.length > 0 && (
          <View style={styles.audioRow}>
            <TouchableOpacity
              style={[styles.speakBtn, isSpeaking && styles.speakBtnStop]}
              onPress={handleReadAloud}
            >
              <Ionicons
                name={isSpeaking ? 'stop-circle' : 'volume-high'}
                size={24}
                color="#0F172A"
              />
              <Text style={styles.speakBtnText}>
                {isSpeaking ? 'Stop Readout' : 'Read Aloud (Couch Mode)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.speedBtn} onPress={cycleSpeed}>
              <Text style={styles.speedText}>{userState.speechRate}x</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer Unlock Toggle */}
        <View style={styles.footer}>
          <Text style={styles.reqLabel}>
            Prerequisite: {cheat.unlockRequirement.summary}
          </Text>
          <TouchableOpacity
            style={[styles.unlockToggle, isUnlocked && styles.unlockToggleDone]}
            onPress={() => toggleUnlocked(cheat.id)}
          >
            <Ionicons
              name={isUnlocked ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={isUnlocked ? '#22C55E' : '#F8FAFC'}
            />
            <Text style={styles.unlockToggleText}>
              {isUnlocked ? 'Unlocked in My Save' : 'Mark Challenge Complete'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  consoleSwitch: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 4,
  },
  consoleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  consoleBtnActive: { backgroundColor: '#38BDF8' },
  consoleText: { color: '#94A3B8', fontWeight: '700' },
  consoleTextActive: { color: '#0F172A' },
  closeBtn: { padding: 6, backgroundColor: '#1E293B', borderRadius: 20 },
  title: { color: '#F8FAFC', fontSize: 28, fontWeight: '800', marginTop: 18 },
  description: { color: '#94A3B8', fontSize: 15, marginTop: 6 },
  activationBanner: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
  },
  activationText: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
    justifyContent: 'center',
  },
  arrowBox: {
    width: 68,
    height: 76,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  arrowBoxActive: { backgroundColor: '#38BDF8', borderColor: '#F8FAFC' },
  stepNum: { color: '#64748B', fontSize: 11, fontWeight: '700', marginTop: 2 },
  pendingText: { color: '#FBBF24', fontSize: 16, textAlign: 'center', marginTop: 20 },
  audioRow: { flexDirection: 'row', gap: 10, marginTop: 28 },
  speakBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#38BDF8',
    paddingVertical: 15,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  speakBtnStop: { backgroundColor: '#F87171' },
  speakBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  speedBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 18,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: { color: '#F8FAFC', fontWeight: '800', fontSize: 15 },
  footer: { marginTop: 'auto', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1E293B' },
  reqLabel: { color: '#94A3B8', fontSize: 13, marginBottom: 10 },
  unlockToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  unlockToggleDone: { borderColor: '#22C55E', borderWidth: 1 },
  unlockToggleText: { color: '#F8FAFC', fontWeight: '700', fontSize: 15 },
});