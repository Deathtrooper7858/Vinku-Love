import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Cómo se muestran las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Pide permiso, obtiene el Expo Push Token y lo guarda en Supabase.
 * Llama esto una vez al iniciar la app (cuando ya hay sesión y pareja).
 */
export async function registerPushToken(profileId: string): Promise<string | null> {
  // En Android se necesita canal de notificaciones
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('vinku-love', {
      name: 'Vinku-love',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF8B7E',
    });
  }

  // Pedir permiso
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('[Vinku-love] Permiso de notificaciones denegado.');
    return null;
  }

  // Obtener token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const validProjectId = projectId && projectId !== 'SE_GENERA_AUTOMATICO_AL_CORRER_EAS_BUILD' ? projectId : undefined;
  const tokenData = await Notifications.getExpoPushTokenAsync(
    validProjectId ? { projectId: validProjectId } : undefined
  );
  const token = tokenData.data;

  // Guardar en Supabase (upsert: actualiza si ya existe)
  await supabase
    .from('push_tokens')
    .upsert({ profile_id: profileId, token, updated_at: new Date().toISOString() });

  return token;
}

/**
 * Llama a la Edge Function de Supabase para enviar una notificación al partner.
 * Se usa en cualquier acción que queremos notificar: "te extraño", ánimo, nota, etc.
 */
export async function notifyPartner(params: {
  senderId: string;
  coupleId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  try {
    await supabase.functions.invoke('notify-partner', {
      body: {
        sender_id: params.senderId,
        couple_id: params.coupleId,
        title: params.title,
        body: params.body,
        data: params.data ?? {},
      },
    });
  } catch (err) {
    // Las notificaciones son "nice to have", no rompemos el flujo si fallan
    console.warn('[Vinku-love] Error enviando push:', err);
  }
}
