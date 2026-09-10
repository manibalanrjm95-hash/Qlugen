"use client";
import { motion } from "motion/react";
import { AppWindowMac, BarChart3, Box, ChartColumnBig, Command, Presentation, ShieldCheck, WandSparkles } from "lucide-react";

export default function AnimatedUiBlock() {
    return (
        <>
            <div className="min-h-[320px] md:min-h-[360px] flex items-center justify-center relative w-full">
                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-950 text-2xl font-semibold text-white shadow-lg dark:bg-white dark:text-slate-950">
                    AI
                </span>
                <motion.div
                    className="absolute start-[70%] top-0 z-10"
                    animate={{
                        y: [-15, 15, -15]
                    }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity
                    }}>
                    <span aria-label="Agentic AI" className="lg:size-18 size-11 flex items-center justify-center rounded-full bg-background">
                        <AppWindowMac size={32} />
                    </span>
                </motion.div>
                <motion.div
                    className="absolute start-[91%] top-[28%] z-10"
                    animate={{
                        y: [15, -15, 15]
                    }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}>
                    <span aria-label="Automations" className="lg:size-12 size-7 flex items-center justify-center rounded-full bg-background">
                        <Command size={24} />
                    </span>
                </motion.div>
                <motion.div
                    className="absolute start-[78%] top-[61%] z-10"
                    animate={{
                        y: [-15, 15, -15]
                    }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: 1
                    }}>
                    <span aria-label="Guardrails" className="lg:size-18 size-11 flex items-center justify-center rounded-full bg-background">
                        <ShieldCheck size={36} />
                    </span>
                </motion.div>
                <motion.div
                    className="absolute end-[78%] top-0"
                    animate={{
                        y: [15, -15, 15]
                    }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}>
                    <span aria-label="Applications" className="lg:size-12 size-7 flex items-center justify-center rounded-full bg-background">
                        <Presentation size={20} />
                    </span>
                </motion.div>
                <motion.div
                    className="absolute end-[67%] lg:top-[61%] top-[80%] z-10"
                    animate={{
                        y: [-15, 15, -15]
                    }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: 0.2
                    }}>
                    <span aria-label="Data" className="lg:size-18 size-11 flex items-center justify-center rounded-full bg-background">
                        <WandSparkles size={32} />
                    </span>
                </motion.div>
                <motion.div
                    className="absolute lg:end-[98%] end-[80%] lg:top-0 top-[30%]"
                    animate={{
                        y: [15, -15, 15]
                    }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: 0.5
                    }}>
                    <span aria-label="Security and governance" className="lg:size-18 size-11 flex items-center justify-center rounded-full bg-background">
                        <BarChart3 size={32} />
                    </span>
                </motion.div>
                <motion.div
                    className="absolute end-[95%] top-[67%] z-10"
                    animate={{
                        y: [-15, 15, -15]
                    }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: 0.7
                    }}>
                    <span aria-label="LLM agnostic" className="lg:size-12 size-7 flex items-center justify-center rounded-full bg-background">
                        <Box size={22} />
                    </span>
                </motion.div>
            </div >
        </>
    )
}
