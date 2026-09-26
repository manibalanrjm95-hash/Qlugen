"use client"

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { Instrument_Serif } from "next/font/google";
import {
  motion,
  type MotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

type aboutusData = {
  icon: LucideIcon;
  title: string;
  color: string;
}[];

const generateText =
  "Qlugen is an AI development agency for teams that need more than advice. We design product experiences, engineer agentic workflows, connect APIs and data, and ship production-ready AI systems. Every build is scoped for real users, secure operations, and measurable business outcomes.";

function ScrollGenerateText() {
  const words = generateText.split(" ");
  const sectionRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.98", "end 0.5"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 18,
    mass: 0.12,
  });
  const fastProgress = useTransform(smoothProgress, (value) =>
    Math.min(1, value * 1.8)
  );

  const wordCount = words.length;

  return (
    <motion.p
      ref={sectionRef}
      className="max-w-[calc(72rem+4px)] text-center text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground tracking-tight leading-tight"
    >
      {words.map((word, index) => (
        <ScrollWord
          key={`${word}-${index}`}
          word={word}
          index={index}
          progress={fastProgress}
          wordCount={wordCount}
        />
      ))}
    </motion.p>
  );
}

function ScrollWord({
  word,
  index,
  progress,
  wordCount,
}: {
  word: string;
  index: number;
  progress: MotionValue<number>;
  wordCount: number;
}) {
  const start = index / wordCount;
  const end = (index + 1) / wordCount;
  const opacity = useTransform(progress, [start, end], [0.3, 1]);
  const y = useTransform(progress, [start, end], [6, 0]);
  const blur = useTransform(progress, [start, end], ["blur(6px)", "blur(0px)"]);

  return (
    <motion.span
      style={{ opacity, y, filter: blur }}
      className="inline-block mr-[0.25em]"
    >
      {word}
    </motion.span>
  );
}

const AboutUs = ({
  aboutusData,
}: {
  aboutusData: aboutusData;
}) => {
  return (
    <section className="lg:py-20 sm:py-16 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-16">
        <div className="flex flex-col items-center justify-center gap-8 md:gap-16">
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className="flex flex-col items-center justify-center gap-4"
          >
            <Badge
              variant={"outline"}
              className="px-3 py-1 h-auto text-sm font-normal"
            >
              About us
            </Badge>
            <ScrollGenerateText />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-4">
              {aboutusData.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 px-6 py-2 rounded-full",
                    item.color
                  )}
                >
                  <item.icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                  <span
                    className={cn(
                      "text-4xl font-normal",
                      instrumentSerif.className
                    )}
                  >
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
