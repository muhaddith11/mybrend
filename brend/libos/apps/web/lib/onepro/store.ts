// Umumiy do'kon mantiqi lib/createStoreState.ts da. Bu fayl faqat
// One Pro uchun store instansiyasini yaratadi (persist kaliti: onepro-design-store).
export * from '../createStoreState'
import { createStoreState } from '../createStoreState'

export const useStore = createStoreState('onepro')
