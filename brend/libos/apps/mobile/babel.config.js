module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated plugin OXIRGI bo'lishi SHART — do'kon sahifalari
    // animatsiyalari (fade/slide/scale reveal) shu orqali ishlaydi.
    plugins: ['react-native-reanimated/plugin'],
  }
}
