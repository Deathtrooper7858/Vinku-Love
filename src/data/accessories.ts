export type AccessoryKey = 'bow' | 'crown' | 'glasses' | 'scarf';

export const ACCESSORY_CATALOG: { key: AccessoryKey; label: string; cost: number; emoji: string }[] = [
  { key: 'bow', label: 'Moño', cost: 30, emoji: '🎀' },
  { key: 'glasses', label: 'Gafas', cost: 50, emoji: '🕶️' },
  { key: 'scarf', label: 'Bufanda', cost: 80, emoji: '🧣' },
  { key: 'crown', label: 'Corona', cost: 150, emoji: '👑' },
];

export function accessoryEmoji(key: string | null | undefined): string | null {
  if (!key) return null;
  const found = ACCESSORY_CATALOG.find((a) => a.key === key);
  return found ? found.emoji : null;
}
