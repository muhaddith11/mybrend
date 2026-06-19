// Umumiy do'kon mantiqi lib/createStoreState.ts da. Bu fayl faqat
// Boosner uchun store instansiyasini yaratadi (persist kaliti: boosner-design-store).
export * from '../createStoreState'
import { createStoreState } from '../createStoreState'

export const useStore = createStoreState('boosner')
