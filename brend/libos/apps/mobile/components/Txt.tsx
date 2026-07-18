import { Text as RNText, StyleSheet, type TextProps } from 'react-native'
import { interFamily } from '../store/theme'

// Inter shriftini XAVFSIZ biriktiruvchi Text o'rnini bosuvchi.
// Ekranlarda faqat import manbasini almashtiramiz:
//   import { Text } from 'react-native'  ->  import { Text } from '../components/Txt'
// JSX o'zgarmaydi. fontWeight'ga qarab mos Inter oilasi qo'yiladi; agar uslubda
// allaqachon fontFamily bo'lsa (do'kon dizaynlari) — o'sha saqlanadi.
// (Monkey-patch EMAS — oddiy komponent, RN va react-native-web'da ishonchli.)
export function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) || ({} as any)
  const family = flat.fontFamily || interFamily(flat.fontWeight)
  return <RNText style={[style, { fontFamily: family }]} {...props} />
}
