import { Badge } from "@/components/ui/badge";
import ReminderAnimation from "@/components/shadcn-space/blocks/bento-grid-01/ReminderAnimation";
import AnimatedUiBlock from "@/components/shadcn-space/blocks/bento-grid-01/AnimatedUiBlock";

const Bentogrid = () => {
  return (
    <section>
      <div className="py-11 md:py-20">
        <div className="max-w-7xl xl:px-16 lg:px-8 px-4 mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-4 items-center justify-center max-w-3xl mx-auto">
            <Badge variant={"outline"} className="px-3 py-1 h-auto text-sm font-normal">
              Development Capabilities
            </Badge>
            <h2 className="text-center md:text-5xl text-3xl mx-auto font-medium">
              Everything needed to build production AI software
            </h2>
            <p className="text-center text-base md:text-lg text-muted-foreground max-w-2xl">
              Qlugen brings the product, engineering, integration, and deployment pieces together so AI can move from prototype to production.
            </p>
          </div>
          <div className="grid grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-4 col-span-12 overflow-hidden h-full">
              <div className="rounded-xl border border-border h-full flex flex-col">
                <div className="bg-muted rounded-t-xl py-8 px-9 relative flex-1 min-h-[340px] flex items-center">
                  <ReminderAnimation />
                </div>
                <div className="flex flex-col gap-0.5 p-8 border-t border-border">
                  <h3 className="text-xl font-medium text-foreground">
                    Agentic Systems
                  </h3>
                  <p className="text-base font-normal text-muted-foreground">
                    Build agents that reason over context, use tools, trigger workflows, and escalate to humans when needed.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 col-span-12 overflow-hidden h-full">
              <div className="rounded-xl border border-border h-full flex flex-col">
                <div className="bg-muted rounded-t-xl py-7 lg:px-30 px-6 relative flex-1 min-h-[340px] flex items-center">
                  <AnimatedUiBlock />
                </div>
                <div className="flex flex-col gap-0.5 p-8 border-t border-border">
                  <h3 className="text-xl font-medium text-foreground">
                    Workflow Automation
                  </h3>
                  <p className="text-base font-normal text-muted-foreground">
                    Connect CRMs, databases, apps, documents, and notifications into reliable AI-assisted workflows.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 col-span-12 overflow-hidden">
              <div className="rounded-xl border border-border h-full flex flex-col">
                <div className="p-8 bg-muted rounded-t-xl flex-1 flex items-center justify-center">
                  <img
                    src="https://images.shadcnspace.com/assets/bento-grid/bento-grid-img-1.png"
                    alt="layout options"
                    className="dark:hidden"
                  />
                  <img
                    src="https://images.shadcnspace.com/assets/bento-grid/bento-grid-darkimg-1.png"
                    alt="layout options"
                    className="hidden dark:block"
                  />
                </div>
                <div className="flex flex-col gap-0.5 p-8 border-t border-border">
                  <h3 className="text-xl font-medium text-foreground">
                    AI Applications
                  </h3>
                  <p className="text-base font-normal text-muted-foreground">
                    Build polished web apps, internal tools, portals, and dashboards with AI built into the core experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 col-span-12 overflow-hidden">
              <div className="rounded-xl border border-border h-full flex flex-col">
                <div className="p-8 bg-muted rounded-t-xl flex-1 flex items-center justify-center">
                  <img
                    src="https://images.shadcnspace.com/assets/bento-grid/bento-grid-img-2.png"
                    alt="documentation"
                    className="dark:hidden"
                  />
                  <img
                    src="https://images.shadcnspace.com/assets/bento-grid/bento-grid-darkimg-2.png"
                    alt="documentation"
                    className="hidden dark:block"
                  />
                </div>
                <div className="flex flex-col gap-0.5 p-8 border-t border-border">
                  <h3 className="text-xl font-medium text-foreground">
                    Data & Retrieval
                  </h3>
                  <p className="text-base font-normal text-muted-foreground">
                    Prepare structured data, documents, vector search, and retrieval flows so your AI features have the right context.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 col-span-12 overflow-hidden">
              <div className="rounded-xl border border-border h-full flex flex-col">
                <div className="p-8 bg-muted rounded-t-xl flex-1 flex items-center justify-center relative">
                  <img
                    src="https://images.shadcnspace.com/assets/bento-grid/bento-grid-img-3.png"
                    alt="color options"
                  />
                </div>
                <div className="flex flex-col gap-0.5 p-8 border-t border-border">
                  <h3 className="text-xl font-medium text-foreground">
                    Guardrails
                  </h3>
                  <p className="text-base font-normal text-muted-foreground">
                    Add evaluations, monitoring, permissions, and review paths so AI behavior stays useful and controlled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bentogrid;
