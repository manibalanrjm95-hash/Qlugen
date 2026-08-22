"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "@/assets/logo/logo";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export type NavigationChild = {
  title: string;
  href: string;
  description?: string;
};

export type NavigationGroup = {
  group: string;
  items: NavigationChild[];
};

export type NavigationSection = {
  title: string;
  href?: string;
  isActive?: boolean;
  children?: NavigationChild[];
  groups?: NavigationGroup[];
};

type HeaderProps = {
  navigationData: NavigationSection[];
  className?: string;
};

const CollaborateButton = ({ className }: { className?: string }) => (
  <a href="/contact" className={cn("block w-fit", className)}>
    <Button className="relative text-sm font-medium rounded-full h-10 p-1 ps-4 pe-12 group transition-all duration-500 hover:ps-12 hover:pe-4 w-fit overflow-hidden cursor-pointer">
      <span className="relative z-10 transition-all duration-500">
        Start a Project
      </span>
      <span className="absolute right-1 w-8 h-8 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-36px)] group-hover:rotate-45">
        <ArrowUpRight size={16} />
      </span>
    </Button>
  </a>
);

const navLinkBase =
  "px-2 lg:px-4 py-2 text-sm font-medium rounded-full text-muted-foreground hover:text-foreground hover:bg-background outline outline-transparent hover:outline-border hover:shadow-xs transition tracking-normal";
const navLinkActive = "bg-background text-foreground";

const Header = ({ navigationData, className }: HeaderProps) => {
  const [sticky, setSticky] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);

  const handleScroll = useCallback(() => {
    setSticky(window.scrollY >= 50);
  }, []);

  const handleResize = useCallback(() => {
    if (window.innerWidth >= 768) setIsOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleScroll, handleResize]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className={cn(
        "fixed left-1/2 top-4 z-50 flex h-auto w-full max-w-7xl -translate-x-1/2 justify-center px-4",
        className
      )}
    >
      <div
        className={cn(
          "w-full flex items-center justify-between gap-3.5 rounded-full border border-border/40 bg-background/75 p-3 shadow-2xl shadow-black/5 backdrop-blur-xl transition-all duration-500 lg:gap-6",
          sticky ? "bg-background/85 shadow-black/10" : ""
        )}
      >
        {/* Logo */}
        <div>
          <a href="/">
            <Logo className="gap-3" />
          </a>
        </div>

        {/* Desktop Navigation */}
        <div>
          <NavigationMenu className="max-lg:hidden bg-muted p-0.5 rounded-full">
            <NavigationMenuList className="flex gap-0">
              {navigationData.map((navItem) => (
                <NavigationMenuItem key={navItem.title}>
                  {navItem.groups ? (
                    <>
                      <NavigationMenuTrigger
                        className={cn(
                          navLinkBase,
                          navItem.isActive ? navLinkActive : "",
                          "bg-transparent data-open:bg-background data-open:text-foreground data-open:outline-border data-popup-open:bg-background data-popup-open:text-foreground rounded-full h-auto"
                        )}
                      >
                        {navItem.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent
                        className={cn(
                          "p-3",
                          navItem.groups.length === 1 ? "w-[300px]" : "w-[520px]"
                        )}
                      >
                        <div
                          className={cn(
                            "grid gap-1",
                            navItem.groups.length === 1 ? "grid-cols-1" : "grid-cols-2"
                          )}
                        >
                          {navItem.groups.map((grp) => (
                            <div key={grp.group} className="p-2">
                              {grp.group ? (
                                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                                  {grp.group}
                                </p>
                              ) : null}
                              <div className="flex flex-col">
                                {grp.items.map((item) => (
                                  <NavigationMenuLink
                                    key={item.title}
                                    href={item.href}
                                    className="px-2 py-2 text-sm rounded-md text-foreground/75 hover:text-foreground hover:bg-muted transition-colors"
                                  >
                                    <span className="block font-medium text-foreground">
                                      {item.title}
                                    </span>
                                    {item.description ? (
                                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                        {item.description}
                                      </span>
                                    ) : null}
                                  </NavigationMenuLink>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : navItem.children ? (
                    <>
                      <NavigationMenuTrigger
                        className={cn(
                          navLinkBase,
                          navItem.isActive ? navLinkActive : "",
                          "bg-transparent data-open:bg-background data-open:text-foreground data-open:outline-border data-popup-open:bg-background data-popup-open:text-foreground rounded-full h-auto"
                        )}
                      >
                        {navItem.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="min-w-[200px] p-1.5">
                        {navItem.children.map((child) => (
                          <NavigationMenuLink
                            key={child.title}
                            href={child.href}
                            className="block px-3 py-2 text-sm rounded-md text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
                          >
                            {child.title}
                          </NavigationMenuLink>
                        ))}
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink
                      href={navItem.href ?? "/"}
                      className={cn(
                        navLinkBase,
                        navItem.isActive ? navLinkActive : ""
                      )}
                    >
                      {navItem.title}
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop CTA + Mobile Trigger */}
        <div className="flex gap-4">
          <CollaborateButton className="hidden lg:flex" />

          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger id="mobile-menu-trigger">
                <span className="rounded-full border border-border p-2 block">
                  <Menu width={20} height={20} />
                  <span className="sr-only">Menu</span>
                </span>
              </SheetTrigger>

              <SheetContent
                showCloseButton={false}
                side="right"
                className="w-full sm:w-96 p-0 border-l-0"
              >
                <div className="flex items-center justify-between p-6">
                  <a href="/">
                    <Logo className="gap-2" />
                  </a>
                  <SheetClose id="mobile-menu-close">
                    <span className="rounded-full border border-border p-2.5 block">
                      <X width={16} height={16} />
                    </span>
                  </SheetClose>
                </div>

                <div className="flex flex-col gap-12 px-6 pb-6 overflow-y-auto">
                  <div className="flex flex-col gap-8">
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <nav className="flex flex-col gap-1">
                      {navigationData.map((item) =>
                        item.groups || item.children ? (
                          <div key={item.title}>
                            <button
                              className="group/nav flex items-center justify-between w-full text-2xl font-semibold tracking-tight text-muted-foreground hover:text-foreground transition-all py-1"
                              onClick={() =>
                                setMobileOpen(
                                  mobileOpen === item.title ? null : item.title
                                )
                              }
                              aria-expanded={mobileOpen === item.title}
                            >
                              {item.title}
                              <ChevronDown
                                className={cn(
                                  "w-5 h-5 transition-transform duration-200",
                                  mobileOpen === item.title ? "rotate-180" : ""
                                )}
                              />
                            </button>
                            {mobileOpen === item.title && (
                              <div className="flex flex-col pl-2 mt-2 mb-2">
                                {item.groups
                                  ? item.groups.map((grp) => (
                                      <div key={grp.group} className="mb-3">
                                        {grp.group ? (
                                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1">
                                            {grp.group}
                                          </p>
                                        ) : null}
                                        {grp.items.map((child) => (
                                          <a
                                            key={child.title}
                                            href={child.href}
                                            className="block text-base text-muted-foreground hover:text-foreground transition-colors py-1"
                                            onClick={() => setIsOpen(false)}
                                          >
                                            <span className="block">{child.title}</span>
                                            {child.description ? (
                                              <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground/70">
                                                {child.description}
                                              </span>
                                            ) : null}
                                          </a>
                                        ))}
                                      </div>
                                    ))
                                  : item.children?.map((child) => (
                                      <a
                                        key={child.title}
                                        href={child.href}
                                        className="block text-base text-muted-foreground hover:text-foreground transition-colors py-0.5"
                                        onClick={() => setIsOpen(false)}
                                      >
                                        {child.title}
                                      </a>
                                    ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <a
                            key={item.title}
                            href={item.href ?? "/"}
                            className={cn(
                              "group/nav flex items-center text-2xl font-semibold tracking-tight transition-all py-1",
                              item.isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground hover:translate-x-2"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            <div
                              className={cn(
                                "h-0.5 bg-primary transition-all duration-300 overflow-hidden",
                                item.isActive
                                  ? "w-4 mr-2 opacity-100"
                                  : "w-0 opacity-0 group-hover/nav:w-4 group-hover/nav:mr-2 group-hover/nav:opacity-100"
                              )}
                            />
                            {item.title}
                          </a>
                        )
                      )}
                    </nav>

                    <div className="w-fit">
                      <CollaborateButton />
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-4">
                    <div className="flex gap-3">
                      {[
                        "lucide:dribbble",
                        "lucide:instagram",
                        "lucide:twitter",
                        "lucide:linkedin",
                      ].map((icon) => (
                        <a
                          key={icon}
                          href="#"
                          className="flex items-center justify-center rounded-full outline outline-border hover:bg-muted transition p-3 shadow-xs"
                        >
                          <Icon icon={icon} width={16} height={16} />
                        </a>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      © 2026 Qlugen
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
