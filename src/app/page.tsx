
'use client'

import Bentogrid from '@/components/shadcn-space/blocks/bento-grid-01/bentogrid'
import AboutAndStats01 from '@/components/shadcn-space/blocks/about-us-01/index'
import Blog from '@/components/shadcn-space/blocks/blog-01/blog'
import Contact from '@/components/shadcn-space/blocks/contact-01/index'
import CTA from '@/components/shadcn-space/blocks/cta-01/cta'
import Faq from '@/components/shadcn-space/blocks/faq-01/faq'
import Feature01 from '@/components/shadcn-space/blocks/feature-01/index'
import Feature02 from '@/components/shadcn-space/blocks/feature-02/index'
import Footer from '@/components/shadcn-space/blocks/footer-02/footer'
import AgencyHeroSection from '@/components/shadcn-space/blocks/hero-01/index'
import Services from '@/components/shadcn-space/blocks/services-02/services'
import Testimonial01 from '@/components/shadcn-space/blocks/testimonial-02'



export default function Page() {
  return (
    <div>

        {/* hero-01 */}
        <section>
          <AgencyHeroSection />
        </section>

        {/* about-us-01 */}
        <section className="pt-12 pb-12 md:pt-20 md:pb-20">
          <AboutAndStats01 />
        </section>

        {/* feature-01 */}
        <section>
          <Feature01 />
        </section>

        {/* bentogrid-01 */}
        <section>
          <Bentogrid />
        </section>

        {/* feature-02 */}
        <section>
          <Feature02 />
        </section>

        {/* services-02 */}
        <section>
          <Services />
        </section>

        {/* testimonial-02 */}
        <section>
          <Testimonial01 />
        </section>

        {/* blog-01 */}
        <section>
          <Blog />
        </section>

        {/* faq-01 */}
        <section>
          <Faq />
        </section>

        {/* contact-01 */}
        <section>
          <Contact />
        </section>

        {/* cta-01 */}
        <section>
          <CTA />
        </section>
    
        {/* footer-02 */}
        <section>
          <Footer />
        </section>
    
    </div>
  )
}
