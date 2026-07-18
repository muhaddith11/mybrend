import { useRef, type ReactNode } from 'react'
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native'

// Bosilganda yumshoq "scale" beruvchi karta/tugma o'ramchisi. TouchableOpacity'ning
// opacity effekti o'rniga — premium his uchun mayda bosish animatsiyasi.
// Reanimated worklet'lariga bog'liq emas (oddiy Animated), shuning uchun hamma
// yerda ishonchli ishlaydi.
export function PressableScale({
  children,
  style,
  onPress,
  scaleTo = 0.97,
  disabled,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
  scaleTo?: number
  disabled?: boolean
}) {
  const scale = useRef(new Animated.Value(1)).current
  const animate = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 50, bounciness: 0 }).start()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  )
}
