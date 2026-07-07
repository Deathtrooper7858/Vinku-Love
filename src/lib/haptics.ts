import * as Haptics from 'expo-haptics';

export type HapticPatternKey = 'soft' | 'double' | 'sos';

export const HAPTIC_PATTERNS: { key: HapticPatternKey; label: string; emoji: string }[] = [
  { key: 'soft', label: 'Suave', emoji: '🤍' },
  { key: 'double', label: 'Doble toque', emoji: '💞' },
  { key: 'sos', label: 'SOS cariño', emoji: '📡' },
];

/**
 * Reproduce el patrón de vibración correspondiente. Se llama tanto en quien
 * envía (confirmación inmediata) como en quien recibe (vía Realtime), para
 * que ambos sientan exactamente el mismo "código de toques".
 */
export async function playHapticPattern(pattern: string) {
  try {
    switch (pattern) {
      case 'double':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await new Promise((r) => setTimeout(r, 150));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'sos':
        for (let i = 0; i < 3; i++) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          await new Promise((r) => setTimeout(r, 120));
        }
        break;
      case 'soft':
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  } catch {
    // Los hápticos pueden fallar en emuladores sin motor de vibración; se ignora.
  }
}
