// Push bildirishnoma — qurilmani ro'yxatdan o'tkazish va Expo token olish.
//
// MUHIM: bu ilova web'ga ham build bo'ladi (react-native-web). expo-notifications
// brauzerda ishlamaydi, shuning uchun har bir chaqiruv `pushSupported` bilan
// himoyalangan — web'da funksiya jimgina `null` qaytaradi va ilova buzilmaydi.

import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'

export const pushSupported = Platform.OS === 'ios' || Platform.OS === 'android'

// Ilova OCHIQ turganda kelgan bildirishnoma ham ko'rinsin (odatda tizim uni
// yashiradi) — mijoz buyurtma sahifasida turganda ham xabarni ko'radi.
if (pushSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}

// Oxirgi ro'yxatdan o'tgan token — chiqishda (logout) uni serverdan o'chirish uchun
// kerak. Qurilmada bittagina faol token bo'ladi, shuning uchun modul darajasida.
let currentPushToken: string | null = null

export function setCurrentPushToken(token: string | null) {
  currentPushToken = token
}

export function getCurrentPushToken(): string | null {
  return currentPushToken
}

/** app.json → extra.eas.projectId. Expo push tokeni shusiz olinmaydi. */
function getProjectId(): string | null {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined
  return extra?.eas?.projectId ?? (Constants as any).easConfig?.projectId ?? null
}

/**
 * Ruxsat so'raydi va Expo push tokenini qaytaradi.
 * `null` qaytsa — push yo'q (web, simulyator, ruxsat berilmagan yoki tarmoq xatosi),
 * bu holda ilova ichidagi bildirishnoma ro'yxati baribir ishlaydi.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!pushSupported) return null
  // Simulyator/emulyatorda push tokeni berilmaydi — bekorga ruxsat so'ramaymiz.
  if (!Device.isDevice) return null

  // Android 8+ kanal: bu bo'lmasa bildirishnoma ovozsiz va past muhimlikda keladi.
  // Nomi "default" — backend har bir push'da shu kanalni ko'rsatadi.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'ZYFF',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#3B6CFF',
    })
  }

  const existing = await Notifications.getPermissionsAsync()
  let granted = existing.granted
  if (!granted) {
    const asked = await Notifications.requestPermissionsAsync()
    granted = asked.granted
  }
  // Foydalanuvchi rad etdi — qayta-qayta so'ramaymiz (iOS baribir bir marta so'raydi).
  if (!granted) return null

  const projectId = getProjectId()
  if (!projectId) return null

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId })
  return data
}
