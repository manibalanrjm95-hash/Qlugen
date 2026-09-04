import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CardImage from "@/components/card-image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "motion/react";

type Features = {
  imageSrc: string;
  content: string;
}[];

const Feature = ({ featureData }: { featureData: Features }) => {
  return (
    <section>
      <div className="lg:py-20 sm:py-16 py-8 ">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col gap-8 md:gap-12">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between gap-4"
            >
              <div className="flex flex-col gap-4 max-w-full items-center md:items-start text-center md:text-left md:max-w-xl">
                <Badge
                  variant={"outline"}
                  className="px-3 py-1 h-auto text-sm font-normal"
                >
                  How we help
                </Badge>
                <h2 className="text-3xl md:text-4xl font-semibold">
                  From idea to production
                </h2>
                <p className="text-lg font-normal text-muted-foreground">
                  We turn AI concepts into shipped products, agents, and automated workflows.
                </p>
              </div>
              <Button className="rounded-full px-5 py-2.5 shadow-xs h-auto cursor-pointer">
                <a href="/capabilities">Explore builds</a>
              </Button>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="p-6 sm:p-16 rounded-2xl bg-[linear-gradient(135deg,rgba(245,243,255,1)_0%,rgba(224,231,255,1)_100%)] h-full w-full"
              >
                <Card className="flex items-start gap-12 has-data-[slot=card-footer]:pb-6! sm:has-data-[slot=card-footer]:pb-10! pt-6 sm:py-10 border-none shadow-none ring-0 rounded-lg">
                  <CardContent className="flex flex-col gap-6 px-6 sm:px-8">
                    <Avatar className="size-12">
                      <AvatarFallback>
                        <CardImage src="people" seed="Mariam Khan" className="size-12 rounded-full border-0" />
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl sm:text-2xl font-medium">
                      "Qlugen helped us turn a rough AI product idea into a working application our team could use quickly."
                    </h3>
                  </CardContent>
                  <CardFooter className="bg-card border-none w-full px-6 sm:px-8 py-0 flex flex-col items-start gap-0.5">
                    <p className="text-sm font-medium text-primary">
                      MARIAM KHAN
                    </p>
                    <span className="text-xs font-normal text-muted-foreground uppercase">
                      COO, PRODUCT CLIENT
                    </span>
                  </CardFooter>
                </Card>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                {featureData?.map((value, index) => {
                  return (
                    <motion.div
                      key={index}
                      initial={{ x: 100, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                        ease: [0.21, 0.47, 0.32, 0.98],
                      }}
                    >
                      <Card className="py-8 bg-muted ring-0 border-0 h-full">
                        <CardContent className="w-full h-full px-8 flex flex-col items-start gap-12 justify-between">
                          <CardImage src={value.imageSrc} seed={value.content} className="h-28 w-full" />
                          <p className="text-base text-foreground font-normal">
                            {value?.content}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feature;
