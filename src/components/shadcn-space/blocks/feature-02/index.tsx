"use client";
import Feature from "@/components/shadcn-space/blocks/feature-02/feature";

const featureData = [
    {
      imageSrc: "data",
      title: "Model Flexible",
      content: "Use the right LLM, vision model, embedding stack, or API for each feature and workflow.",
    },
    {
      imageSrc: "systems",
      title: "Deploy Anywhere",
      content: "Launch on cloud, private cloud, or your own infrastructure with deployment choices that fit your stack.",
    },
    {
      imageSrc: "product",
      title: "Composable Builds",
      content: "Create reusable agents, prompts, tools, APIs, and UI components that scale across products.",
    }
];

const Feature02 = () => {
  return (
    <>
      <Feature featureData={featureData} />
    </>
  );
};

export default Feature02;
