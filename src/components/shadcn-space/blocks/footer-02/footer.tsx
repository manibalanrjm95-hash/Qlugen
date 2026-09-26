import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default function Footer() {
    const footerLinks = [
        { label: "Home", href: "#" },
        { label: "Services", href: "#" },
        { label: "Approach", href: "#" },
        { label: "Industries", href: "#" },
        { label: "Testimonials", href: "#" },
        { label: "Blog", href: "#" },
        { label: "FAQs", href: "#" },
        { label: "Contact", href: "#" },
    ]
    return (
        <footer className="dark bg-background">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 md:py-24 py-8">
                <div className="flex flex-col gap-16">
                    <div className="flex flex-col gap-12">
                        <div className='grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100 ease-in-out fill-mode-both'>
                            <div className="col-span-12 md:col-span-3">
                                <p className='w-full text-foreground'>
                                    Qlugen is an AI development agency building products, agents, automations, and integrations.
                                </p>
                            </div>
                            <div className="md:col-span-1" />
                            <div className="col-span-12 md:col-span-8">
                                <div className='flex flex-col lg:flex-row gap-5 lg:gap-10'>
                                    <form className='flex gap-2 flex-1'>
                                        <Input
                                            required
                                            type="email"
                                            name="email"
                                            placeholder="enter your email"
                                            className="rounded-full h-full py-2 text-white"
                                        />
                                        <Button type='submit' className='h-auto py-2 px-4 rounded-full cursor-pointer font-medium hover:bg-primary/80'>
                                            Subscribe
                                        </Button>
                                    </form>
                                    <p className='text-sm flex-1 text-foreground'>
                                        Get occasional updates on AI product development, agent design, automation, and launch.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Separator />
                    </div>
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 md:col-span-7 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100 ease-in-out fill-mode-both">
                            <h2 className="sm:text-5xl text-3xl font-medium mb-6 text-foreground">
                                Ready to build something useful with AI?
                            </h2>
                            <Button className="py-3.5 px-6 rounded-full bg-primary hover:bg-primary/80 h-auto">
                                Get in touch
                            </Button>
                        </div>
                        <div className="md:col-span-1" />
                        <div className="col-span-12 md:col-span-2 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100 ease-in-out fill-mode-both">
                            <div className="flex flex-col gap-4">
                                {footerLinks.slice(0, 4).map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="block text-base text-muted-foreground hover:text-primary"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-2 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 ease-in-out fill-mode-both">
                            <div className="flex flex-col gap-4">
                                {footerLinks.slice(4, 8).map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="block text-base text-muted-foreground hover:text-primary"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-12">
                        <Separator />
                        <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 ease-in-out fill-mode-both">
                            Copyright 2026 Qlugen. All Rights Reserved
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
