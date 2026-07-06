import { useMemo, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Switch, Modal, Pressable, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useT, type Lang } from '@libos/shared'
import { useAuthStore } from '../../store/auth'
import { useLangStore } from '../../store/lang'
import { useTheme, useThemeStore, type ThemeColors } from '../../store/theme'
import { useAvatarStore, PERSON_EMOJIS } from '../../store/avatar'

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'uz', flag: '🇺🇿', label: "O'zbek" },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
]

export default function ProfileScreen() {
  const router = useRouter()
  const { isLoggedIn, user, logout } = useAuthStore()
  const { lang, setLang } = useLangStore()
  const { colors, dark } = useTheme()
  const toggleTheme = useThemeStore(s => s.toggle)
  const { emoji, setEmoji } = useAvatarStore()
  const [showPicker, setShowPicker] = useState(false)
  const tr = useT(lang)
  const styles = useMemo(() => makeStyles(colors), [colors])

  // Chiqishdan oldin tasdiq so'raymiz — tasodifan bosib qo'yilmasin.
  const confirmLogout = () => {
    const title = lang === 'ru' ? 'Выйти из аккаунта?' : lang === 'en' ? 'Log out?' : 'Hisobdan chiqasizmi?'
    const cancel = lang === 'ru' ? 'Отмена' : lang === 'en' ? 'Cancel' : 'Bekor qilish'
    Alert.alert(title, undefined, [
      { text: cancel, style: 'cancel' },
      { text: tr.logout, style: 'destructive', onPress: () => { logout() } },
    ])
  }

  const menuItems = [
    { icon: 'receipt-outline', label: tr.myOrders, onPress: () => router.push('/orders') },
    { icon: 'heart-outline', label: tr.mFavStores, onPress: () => router.push('/favorites') },
    { icon: 'help-circle-outline', label: tr.help, onPress: () => router.push('/help') },
  ]

  // Sozlamalar bloki — til + tungi rejim (web ProfileDrawer bilan bir xil)
  const settingsBlock = (
    <View style={styles.settingsSection}>
      <Text style={styles.settingsTitle}>{tr.settings}</Text>

      <View style={styles.langRow}>
        <Ionicons name="globe-outline" size={20} color={colors.accent} />
        <Text style={styles.menuLabel}>{tr.language}</Text>
      </View>
      <View style={styles.langBtns}>
        {LANGS.map(l => (
          <TouchableOpacity
            key={l.code}
            style={[styles.langBtn, lang === l.code && styles.langBtnActive]}
            onPress={() => setLang(l.code)}
          >
            <Text style={styles.langFlag}>{l.flag}</Text>
            <Text style={[styles.langLabel, lang === l.code && styles.langLabelActive]}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.themeRow}>
        <Ionicons name={dark ? 'moon' : 'moon-outline'} size={20} color={colors.accent} />
        <Text style={styles.menuLabel}>{tr.darkMode}</Text>
        <Switch
          value={dark}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={colors.white}
        />
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{tr.profile}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {isLoggedIn && user ? (
        <>
          <View style={styles.userCard}>
            <TouchableOpacity style={styles.avatar} onPress={() => setShowPicker(true)}>
              <Text style={styles.avatarEmoji}>{emoji}</Text>
              <View style={styles.avatarEdit}>
                <Ionicons name="pencil" size={11} color={colors.white} />
              </View>
            </TouchableOpacity>
            <View>
              <Text style={styles.userName}>{user.name ?? tr.user}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
            </View>
          </View>

          {menuItems.map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
              <Ionicons name={item.icon as any} size={20} color={colors.accent} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text3} />
            </TouchableOpacity>
          ))}

          {settingsBlock}

          <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={styles.logoutText}>{tr.logout}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteAccountLink}
            onPress={() => router.push('/auth/delete-account')}
          >
            <Text style={styles.deleteAccountText}>{tr.mDeleteAccount}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.loginCard}>
            <Ionicons name="person-circle-outline" size={64} color={colors.brand} />
            <Text style={styles.loginTitle}>{tr.loginToProfile}</Text>
            <Text style={styles.loginText}>{tr.mLoginCardText}</Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.loginBtnText}>{tr.login}</Text>
            </TouchableOpacity>
          </View>

          {settingsBlock}

          {menuItems.map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => router.push('/auth/login')}
            >
              <Ionicons name={item.icon as any} size={20} color={colors.text3} />
              <Text style={[styles.menuLabel, { color: colors.text3 }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.border} />
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Do'kon egasi paneli (har doim ko'rinadi — buyer login'dan alohida).
          Xavfsizlik: panelga har kirganda login/parol so'raladi (token saqlanmaydi). */}
      <TouchableOpacity
        style={styles.ownerBtn}
        onPress={() => router.push('/admin/login')}
      >
        <Ionicons name="storefront-outline" size={20} color={colors.accent} />
        <Text style={styles.ownerLabel}>
          {lang === 'ru' ? 'Панель продавца' : lang === 'en' ? 'Seller panel' : "Do'kon egasi paneli"}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.text3} />
      </TouchableOpacity>

      {/* Huquqiy havolalar */}
      <View style={styles.legalRow}>
        <TouchableOpacity onPress={() => router.push('/privacy')}>
          <Text style={styles.legalLink}>{lang === 'ru' ? 'Конфиденциальность' : lang === 'en' ? 'Privacy' : 'Maxfiylik'}</Text>
        </TouchableOpacity>
        <Text style={styles.legalDot}>·</Text>
        <TouchableOpacity onPress={() => router.push('/terms')}>
          <Text style={styles.legalLink}>{lang === 'ru' ? 'Условия' : lang === 'en' ? 'Terms' : 'Shartlar'}</Text>
        </TouchableOpacity>
        <Text style={styles.legalDot}>·</Text>
        <TouchableOpacity onPress={() => router.push('/about')}>
          <Text style={styles.legalLink}>{tr.aboutUs}</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      {/* Avatar tanlash modali */}
      <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>{tr.settings}</Text>
            <View style={styles.emojiGrid}>
              {PERSON_EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
                  onPress={() => { setEmoji(e); setShowPicker(false) }}
                >
                  <Text style={styles.emojiChar}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  scroll: { paddingBottom: 32 },
  header: { padding: 20, backgroundColor: c.surface, borderBottomWidth: 0.5, borderBottomColor: c.border },
  headerTitle: { fontSize: 20, fontWeight: '600', color: c.text },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 14, margin: 16, backgroundColor: c.surface, borderRadius: 16, padding: 20, borderWidth: 0.5, borderColor: c.border },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: c.brandLight, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarEmoji: { fontSize: 28 },
  avatarEdit: { position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.surface },
  userName: { fontSize: 16, fontWeight: '600', color: c.text },
  userPhone: { fontSize: 13, color: c.text2, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.surface, padding: 16, marginHorizontal: 16, marginBottom: 1, borderRadius: 2 },
  menuLabel: { flex: 1, fontSize: 14, color: c.text },
  settingsSection: { backgroundColor: c.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: c.border },
  settingsTitle: { fontSize: 12, fontWeight: '600', color: c.text3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  langBtns: { flexDirection: 'row', gap: 8 },
  langBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface2 },
  langBtnActive: { borderColor: c.accent, backgroundColor: c.accentSoft },
  langFlag: { fontSize: 16 },
  langLabel: { fontSize: 12, color: c.text2, fontWeight: '500' },
  langLabelActive: { color: c.accent },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, marginTop: 24, padding: 16, backgroundColor: c.surface2, borderRadius: 12 },
  logoutText: { fontSize: 14, color: c.danger, fontWeight: '500' },
  deleteAccountLink: { alignItems: 'center', paddingVertical: 8, marginBottom: 16 },
  deleteAccountText: { fontSize: 12, color: c.text3, textDecorationLine: 'underline' },
  ownerBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.surface, marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12, borderWidth: 0.5, borderColor: c.border },
  ownerLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: c.text },
  legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  legalLink: { fontSize: 12, color: c.text3 },
  legalDot: { fontSize: 12, color: c.text3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 32 },
  modalCard: { backgroundColor: c.surface, borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 16, textAlign: 'center' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  emojiBtn: { width: 52, height: 52, borderRadius: 14, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  emojiBtnActive: { borderColor: c.brand, backgroundColor: c.brandLight },
  emojiChar: { fontSize: 26 },
  loginCard: { margin: 16, backgroundColor: c.surface, borderRadius: 16, padding: 24, alignItems: 'center', gap: 10, borderWidth: 0.5, borderColor: c.border },
  loginTitle: { fontSize: 18, fontWeight: '600', color: c.text },
  loginText: { fontSize: 13, color: c.text2, textAlign: 'center', lineHeight: 20 },
  loginBtn: { marginTop: 8, backgroundColor: c.brand, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10, width: '100%', alignItems: 'center' },
  loginBtnText: { color: c.white, fontWeight: '600', fontSize: 15 },
})
