"use client";
import Feature from "@/components/shadcn-space/blocks/feature-01/feature";

const featureData = [
    {
      imageSrc: "product",
      content: "Turn product ideas into scoped AI features, prototypes, and production roadmaps.",
    },
    {
      imageSrc: "workflow",
      content: "Build automations that connect apps, data, approvals, and human review where needed.",
    },
    {
      imageSrc: "agents",
      content: "Develop custom agents with tools, memory, guardrails, and measurable task performance.",
    },
    {
      imageSrc: "systems",
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
