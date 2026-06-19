export * from '../createSettingsApi'
import { createSettingsApi } from '../createSettingsApi'

export const { fetchSettings, updateSettings } = createSettingsApi('asma')
