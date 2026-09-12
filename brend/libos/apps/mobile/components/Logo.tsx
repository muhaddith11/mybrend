import { Image, type ImageStyle, type StyleProp } from 'react-native'
import { useTheme } from '../store/theme'

// ZYFF brend belgisi — bitta joyda. Ilova ikonkasidagi kontur yozuvning o'zi:
// assets/zyff-wordmark.png icon.png'dan ajratib olingan (ramka oq, ichi va tashqarisi
// shaffof). Rang `tintColor` bilan beriladi; ichi shaffof bo'lgani uchun har doim fon
// ko'rinadi — to'q fonda oq ramka, ochiq fonda to'q ramka.
// Shrift bilan chizilmaydi: aks holda belgi ikonkadagidan farq qilib qolardi.
const WORDMARK = require('../assets/zyff-wordmark.png')
const RATIO = 984 / 268 // PNG o'lchami (kenglik / balandlik)

interface LogoProps {
  /** Belgi balandligi (px). Kengligi nisbatdan hisoblanadi. */
  size?: number
  /** Ramka rangi (default — mavzu matn rangi) */
  color?: string
  style?: StyleProp<ImageStyle>
}

export function Logo({ size = 20, color, style }: LogoProps) {
  const { colors } = useTheme()
  return (
    <Image
      source={WORDMARK}
      style={[{ height: size, width: Math.round(size * RATIO), tintColor: color ?? colors.text }, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="ZYFF"
    />
  )
}
