import type { SVGAttributes } from "react";

const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold">
        Q
      </div>
      <span className="text-2xl font-semibold tracking-tight text-foreground">
        Qlugen
      </span>
    </div>
  );
};

export default Logo;
