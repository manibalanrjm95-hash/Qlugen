"use client";
import Feature from "@/components/shadcn-space/blocks/feature-01/feature";
import { ArrowDownUp, BellRing, RotateCw, Tag } from "lucide-react"

const featureData = [
    {
      icon: ArrowDownUp,
      content: "Turn product ideas into scoped AI features, prototypes, and production roadmaps.",
    },
    {
      icon: BellRing,
      content: "Build automations that connect apps, data, approvals, and human review where needed.",
    },
    {
      icon: RotateCw,
      content: "Develop custom agents with tools, memory, guardrails, and measurable task performance.",
    },
    {
      icon: Tag,
      content: "Ship reusable components, integrations, and deployment patterns for faster iteration.",
    },
];

const Feature01 = () => {
  return (
    <>
      <Feature featureData={featureData} />
    </>
  );
};

export default Feature01;
