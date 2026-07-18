import { Component, type ReactNode } from 'react'
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Text } from './Txt'
import { Ionicons } from '@expo/vector-icons'
import { getColors, useThemeStore, type ThemeColors } from '../store/theme'
import { useLangStore } from '../store/lang'
import { captureException } from '../lib/sentry'

// Global JS-crash himoyasi. Render paytida kutilmagan xato yuz bersa, oq ekran
// o'rniga tiklash tugmasi bilan chiroyli fallback ko'rsatiladi.
// Kelajakda bu yerdan xatoni Sentry/crash-reporting'ga yuborish mumkin (onError).
interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    // Xatoni Sentry'ga yuboramiz (DSN sozlangan bo'lsa), dev'da konsolga.
    captureException(error)
    if (__DEV__) console.error('[ErrorBoundary]', error)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return <Fallback error={this.state.error} onReset={this.reset} />
    }
    return this.props.children
  }
}

// Fallback — hook'lardan (theme/lang) foydalanish uchun alohida funksional komponent.
function Fallback({ error, onReset }: { error: Error; onReset: () => void }) {
  const dark = useThemeStore(s => s.dark)
  const lang = useLangStore(s => s.lang)
  const colors = getColors(dark ? 'dark' : 'light')
  const styles = makeStyles(colors)

  const title = lang === 'ru' ? 'Что-то пошло не так' : lang === 'en' ? 'Something went wrong' : 'Nimadir xato ketdi'
  const subtitle =
    lang === 'ru'
      ? 'Приложение столкнулось с ошибкой. Попробуйте ещё раз.'
      : lang === 'en'
      ? 'The app hit an unexpected error. Please try again.'
      : "Ilovada kutilmagan xato yuz berdi. Iltimos, qayta urinib ko'ring."
  const retry = lang === 'ru' ? 'Перезапустить' : lang === 'en' ? 'Restart' : 'Qayta ishga tushirish'

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="alert-circle-outline" size={44} color={colors.danger} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {__DEV__ && <Text style={styles.detail}>{error.message}</Text>}
      <TouchableOpacity style={styles.btn} onPress={onReset} activeOpacity={0.85}>
        <Text style={styles.btnText}>{retry}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12, backgroundColor: c.bg },
  iconWrap: { width: 88, height: 88, borderRadius: 28, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: c.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: c.text2, textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  detail: { fontSize: 12, color: c.text3, textAlign: 'center', marginTop: 4, fontStyle: 'italic' },
  btn: { marginTop: 12, backgroundColor: c.brand, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: c.white, fontSize: 15, fontWeight: '600' },
})
