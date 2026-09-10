"use client";
import { Marquee } from "@/components/shadcn-space/animations/marquee";
import { motion } from "motion/react";

export interface BrandList {
  image: string;
  name: string;
  lightimg: string;
}

function BrandSlider({ brandList }: { brandList: BrandList[] }) {
  return (
    <section>
      <div className="pt-12 md:pt-20 pb-6 md:pb-10">
        <div className="mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6, ease: "easeInOut" }}
            className="flex flex-col gap-3"
          >
            <div className="flex justify-center text-center py-3 md:py-4 relative">
              <div className="flex items-center justify-center gap-4">
                <div className="hidden h-0.5 w-40 bg-linear-to-l from-white/40 to-transparent md:block" />
                <p className="px-10 text-center text-sm font-normal text-white/70 sm:px-2">
                  Loved by 1000+ big and small brands around the worlds
                </p>
                <div className="hidden h-0.5 w-40 bg-linear-to-r from-white/40 to-transparent md:block" />
              </div>
            </div>
            {brandList && brandList.length > 0 && (
              <div className="py-4">
                <Marquee pauseOnHover className="[--duration:20s] p-0">
                  {brandList.map((brand, index) => (
                    <div key={index}>
                      <img
                        src={brand.lightimg}
                        alt={brand.name}
                        className="mr-12 h-8 w-36 lg:mr-20"
                      />
                    </div>
                  ))}
                </Marquee>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default BrandSlider;
