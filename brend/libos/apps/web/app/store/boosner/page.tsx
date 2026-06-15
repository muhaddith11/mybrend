import { Hero } from '@/components/boosner/hero'
import { FeaturedSection } from '@/components/boosner/featured-section'
import { CategoriesSection } from '@/components/boosner/categories-section'
import { BrandStorySection } from '@/components/boosner/brand-story-section'
import { ContactCtaSection } from '@/components/boosner/contact-cta-section'

export const metadata = {
  title: 'Boosner | Premium Erkaklar Kiyimi',
}

export default function BoosnerHomePage() {
  return (
    <>
      <Hero />
      <FeaturedSection />
      <CategoriesSection />
      <BrandStorySection />
      <ContactCtaSection />
    </>
  )
}
