// Monorepo'da root node_modules'da React 19, bu app'da React 18.3.1 bor.
// Metro ba'zi paketlarni (safe-area-context, expo-router ichki qismlari) root'dagi
// React 19'ga ulаб "Invalid hook call / duplicate React" xatosini berardi.
// Quyidagi resolver react/react-dom'ni HAR DOIM shu app'ning lokal nusxasidan oladi —
// web va native build ikkalasida ham bitta React kafolatlanadi.
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

const localReact = path.resolve(__dirname, 'node_modules/react')
const localReactDom = path.resolve(__dirname, 'node_modules/react-dom')

const original = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react' || moduleName.startsWith('react/')) {
    return { type: 'sourceFile', filePath: require.resolve(moduleName, { paths: [localReact + '/..'] }) }
  }
  if (moduleName === 'react-dom' || moduleName.startsWith('react-dom/')) {
    return { type: 'sourceFile', filePath: require.resolve(moduleName, { paths: [localReactDom + '/..'] }) }
  }
  return (original ?? context.resolveRequest)(context, moduleName, platform)
}

module.exports = config
