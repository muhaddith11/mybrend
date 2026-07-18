import { type TextStyle, type StyleProp } from 'react-native'
import { Text } from './Txt'
import { useTheme } from '../store/theme'

// ZYFF brend wordmark'i — bitta joyda. Hamma header/footer/ekranlarda shu ishlatiladi.
// Qo'yilgan joyning uslubiga moslashadi: size/color/accentColor/font/weight prop orqali.
// - Default: tizim shrifti (fontWeight 800, letterSpacing 1.5) — hozirgi ko'rinish.
// - font berilsa (masalan bespoke do'kon shrifti) — o'sha shrift ishlatiladi,
//   bunda fontWeight tushiriladi (shrift fayli o'z qalinligini olib keladi).
interface LogoProps {
  size?: number
  /** "ZY" qismi rangi (default — mavzu matn rangi) */
  color?: string
  /** "FF" urg'u qismi rangi (default — mavzu gold accent) */
  accentColor?: string
  /** Joy shriftiga moslash uchun (masalan 'SpaceGrotesk_700Bold'). Berilmasa — tizim shrifti. */
  font?: string
  weight?: TextStyle['fontWeight']
  letterSpacing?: number
  style?: StyleProp<TextStyle>
}

export function Logo({
  size = 20,
  color,
  accentColor,
  font,
  weight = '800',
  letterSpacing = 1.5,
  style,
}: LogoProps) {
  const { colors } = useTheme()

  const base: TextStyle = {
    fontSize: size,
    letterSpacing,
    color: color ?? colors.text,
    // Maxsus shrift bo'lsa fontWeight bermaymiz (fayl o'z qalinligini beradi).
    ...(font ? { fontFamily: font } : { fontWeight: weight }),
  }
  const accent: TextStyle = {
    color: accentColor ?? colors.accent,
    ...(font ? { fontFamily: font } : null),
  }

  return (
    <Text style={[base, style]} allowFontScaling={false}>
      ZY<Text style={accent}>FF</Text>
    </Text>
  )
}
