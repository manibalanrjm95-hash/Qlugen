import BrandSlider, { BrandList } from "@/components/shadcn-space/blocks/testimonial-02/brand-slider";
import Testimonial01Inner, { Testimonial } from "@/components/shadcn-space/blocks/testimonial-02/testimonial";

const brandList: BrandList[] = [
    {
        image: "https://images.shadcnspace.com/assets/brand-logo/logoipsum-muted-1.svg",
        lightimg: "https://images.shadcnspace.com/assets/brand-logo/logoipsum-muted-white-1.svg",
        name: "Brand 1",
    },
    {
        image: "https://images.shadcnspace.com/assets/brand-logo/logoipsum-muted-2.svg",
        lightimg: "https://images.shadcnspace.com/assets/brand-logo/logoipsum-muted-white-2.svg",
        name: "Brand 2",
    },
    {
        image: "https://images.shadcnspace.com/assets/brand-logo/logoipsum-muted-3.svg",
        lightimg: "https://images.shadcnspace.com/assets/brand-logo/logoipsum-muted-white-3.svg",
        name: "Brand 3",
    },
    {
        image: "https://images.shadcnspace.com/assets/brand-logo/logoipsum-muted-4.svg",
        lightimg: "https://images.shadcnspace.com/assets/brand-logo/logoipsum-muted-white-4.svg",
        name: "Brand 4",
    },
    {
        image: "https://images.shadcnspace.com/assets/brand-logo/logoipsum-muted-5.svg",
        lightimg: "https://images.shadcnspace.com/assets/brand-logo/logoipsum-muted-white-5.svg",
        name: "Brand 5",
    },
];

const defaultTestimonials: Testimonial[] = [
    {
        quote: "Qlugen turned our AI product concept into a working internal tool with the right integrations, guardrails, and launch plan.",
        author: "Mariam Khan",
        role: "COO, SaaS Client",
        image: "https://images.shadcnspace.com/assets/profiles/testimonial-user.png",
    },
    {
        quote: "Their team understood the product, wrote the code, connected our systems, and kept the build moving without drama.",
        author: "Daniel Brooks",
        role: "VP Operations, Enterprise Client",
        image: "https://images.shadcnspace.com/assets/profiles/testimonial-user-2.png",
    },
];

export default function Testimonial01() {
    return (
        <main>
            <Testimonial01Inner testimonials={defaultTestimonials} />
            <BrandSlider brandList={brandList} />
        </main>
    );
}
