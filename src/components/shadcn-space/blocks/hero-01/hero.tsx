"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export type AvatarList = {
  image: string;
};

type HeroSectionProps = {
  avatarList: AvatarList[];
};

function HeroSection({ avatarList }: HeroSectionProps) {
  return (
    <section>
      <div className="w-full h-full relative">
        <div className="relative w-full pt-24 md:pt-28 pb-6 md:pb-10">
          <div className="container mx-auto relative z-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-8 pt-8 sm:pt-12 md:pt-16">
              <div className="relative flex flex-col text-center items-center sm:gap-6 gap-4">
                <motion.h1
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="text-[54px] font-bold leading-[70px] text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.45)] md:text-[78px] md:leading-[98px] lg:text-[102px] lg:leading-[124px]"
                >
                  AI development agency
                  <br />
                  <span
                    className="italic tracking-tight"
                  >
                    for products, agents, automation
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.1, ease: "easeInOut" }}
                  className="max-w-2xl text-base font-normal text-white/75"
                >
                  We design, build, and launch AI-powered software, custom agents,
                  workflow automations, and integrations that move from idea to
                  production.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
                className="flex items-center flex-col md:flex-row justify-center gap-8"
              >
                <Button className="group relative h-12 w-fit cursor-pointer overflow-hidden rounded-full bg-white p-1 ps-6 pe-14 text-sm font-medium text-black shadow-[0_16px_40px_rgba(0,0,0,0.25)] transition-all duration-500 hover:bg-white/90 hover:ps-14 hover:pe-6">
                  <span className="relative z-10 transition-all duration-500">
                    Book a Build Call
                  </span>
                  <span className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45">
                    <ArrowUpRight size={16} />
                  </span>
                </Button>
                <div className="flex items-center sm:gap-7 gap-3">
                  <ul className="avatar flex flex-row items-center">
                    {avatarList.map((avatar, index) => (
                      <li key={index} className="-mr-2 z-1 avatar-hover:ml-2">
                        <img
                          src={avatar.image}
                          alt="Avatar"
                          width={40}
                          height={40}
                          className="rounded-full border-2 border-white"
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="gap-1 flex flex-col items-start">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <img
                          key={index}
                          src="https://images.shadcnspace.com/assets/svgs/icon-star.svg"
                          alt="star"
                          className="h-4 w-4"
                        />
                      ))}
                    </div>
                    <p className="text-xs font-normal text-white/70 sm:text-sm">
                      Trusted by teams building with AI
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
