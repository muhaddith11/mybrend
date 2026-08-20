module.exports = function (api) {
  api.cache(true)
  return {
    // Reanimated/worklets babel plugin'i SDK 57 da `babel-preset-expo` ichida
    // AVTOMATIK sozlanadi (react-native-worklets o'rnatilgani aniqlanganda).
    // Uni qo'lda `plugins` ga qo'shish plugin'ni ikki marta qo'llaydi —
    // shuning uchun bu yerda plugins bo'sh. Do'kon sahifalari animatsiyalari
    // (fade/slide/scale reveal) shundayam ishlaydi.
    presets: ['babel-preset-expo'],
  }
}
