"use client";
import AboutUs from "@/components/shadcn-space/blocks/about-us-01/about-us";
import { Target, WandSparkles, Zap } from "lucide-react";

const aboutusData = [
    {
      icon: WandSparkles,
      title: "Product Design",
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      icon: Zap,
      title: "AI Engineering",
      color: "bg-teal-400/10 text-teal-400" 
    },
    {
      icon: Target,
      title: "Launch",
      color: "bg-orange-400/10 text-orange-400" 
    }
];

const AboutAndStats01 = () => {
  return (
    <>
      <AboutUs aboutusData={aboutusData} />
    </>
  );
};

export default AboutAndStats01;
