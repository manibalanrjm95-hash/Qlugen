import CardImage from "@/components/card-image";

type VisualPanelProps = {
  variant?: "product" | "agents" | "systems" | "workflow" | "editorial" | "people" | "data";
  className?: string;
  label?: string;
};

const visualSources = {
  product: "product",
  agents: "agents",
  systems: "systems",
  workflow: "workflow",
  editorial: "editorial",
  people: "people",
  data: "data",
} as const;

export default function VisualPanel({ variant = "systems", className = "", label }: VisualPanelProps) {
  return <CardImage src={visualSources[variant]} className={className} alt={label ?? ""} seed={label ?? variant} />;
}
