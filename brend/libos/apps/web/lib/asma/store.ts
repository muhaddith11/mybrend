// Umumiy do'kon mantiqi lib/createStoreState.ts da. Bu fayl faqat
// ASMA uchun store instansiyasini yaratadi (persist kaliti: asma-design-store).
export * from '../createStoreState'
import { createStoreState } from '../createStoreState'

export const useStore = createStoreState('asma')
