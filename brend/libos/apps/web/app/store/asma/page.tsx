import { Hero } from '@/components/asma/hero'
import { FeaturedSection } from '@/components/asma/featured-section'
import { CategoriesSection } from '@/components/asma/categories-section'
import { BrandStorySection } from '@/components/asma/brand-story-section'
import { ContactCtaSection } from '@/components/asma/contact-cta-section'

export const metadata = {
  title: 'Asma Design | Premium Erkaklar Kiyimi',
}

export default function AsmaHomePage() {
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
