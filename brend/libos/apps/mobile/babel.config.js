module.exports = function (api) {
  api.cache(true)
  return {
    // nativewind olib tashlandi — ilovada className/tailwind ishlatilmagan, faqat
    // RN StyleSheet. nativewind/babel `react-native-worklets/plugin`ni talab qilib
    // build'ni yiqitardi (reanimated o'rnatilmagan).
    presets: ['babel-preset-expo'],
  }
}
