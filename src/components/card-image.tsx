type CardImageProps = {
  src?: string;
  alt?: string;
  className?: string;
  seed?: string;
};

const themeNames = {
  product: "product",
  agents: "agents",
  systems: "systems",
  workflow: "workflow",
  editorial: "editorial",
  people: "people",
  data: "data",
} as const;

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function createArtwork(theme: string, seed: string) {
  const hash = hashString(`${theme}:${seed}`);
  const hueA = hash % 360;
  const hueB = (hueA + 42) % 360;
  const hueC = (hueA + 210) % 360;
  const accentX = 80 + (hash % 180);
  const accentY = 60 + ((hash >> 3) % 120);
  const barA = 48 + ((hash >> 5) % 70);
  const barB = 40 + ((hash >> 7) % 80);
  const barC = 54 + ((hash >> 9) % 68);

  const common = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hueA} 70% 98%)"/>
        <stop offset="100%" stop-color="hsl(${hueB} 55% 94%)"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hueA} 72% 58%)"/>
        <stop offset="100%" stop-color="hsl(${hueB} 66% 50%)"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#141823" flood-opacity="0.12"/>
      </filter>
    </defs>
    <rect width="600" height="400" rx="28" fill="url(#bg)"/>
    <circle cx="${accentX}" cy="${accentY}" r="74" fill="hsl(${hueC} 70% 92%)"/>
    <rect x="84" y="56" width="432" height="288" rx="28" fill="#fff" stroke="#E5E7EB" filter="url(#shadow)"/>
  `;

  const scenes: Record<string, string> = {
    product: `
      <rect x="112" y="86" width="126" height="16" rx="8" fill="hsl(${hueA} 72% 92%)"/>
      <rect x="124" y="92" width="72" height="4" rx="2" fill="url(#accent)"/>
      <rect x="112" y="126" width="148" height="178" rx="22" fill="#201b39"/>
      <rect x="138" y="150" width="72" height="72" rx="18" fill="url(#accent)"/>
      <rect x="138" y="238" width="88" height="10" rx="5" fill="#fff" fill-opacity=".88"/>
      <rect x="284" y="126" width="204" height="82" rx="20" fill="#F8FAFC" stroke="#E5E7EB"/>
      <rect x="310" y="150" width="96" height="10" rx="5" fill="#111827" fill-opacity=".8"/>
      <rect x="310" y="170" width="142" height="8" rx="4" fill="#6B7280" fill-opacity=".38"/>
      <rect x="284" y="226" width="96" height="78" rx="18" fill="hsl(${hueB} 72% 96%)" stroke="hsl(${hueB} 52% 86%)"/>
      <rect x="392" y="226" width="96" height="78" rx="18" fill="url(#accent)"/>
    `,
    agents: `
      <rect x="112" y="86" width="92" height="12" rx="6" fill="#111827" fill-opacity=".78"/>
      <circle cx="202" cy="198" r="58" fill="hsl(${hueA} 72% 96%)" stroke="hsl(${hueA} 56% 86%)"/>
      <circle cx="202" cy="198" r="20" fill="url(#accent)"/>
      <circle cx="326" cy="136" r="28" fill="hsl(${hueC} 72% 94%)" stroke="hsl(${hueC} 46% 84%)"/>
      <circle cx="414" cy="198" r="28" fill="hsl(${hueB} 72% 96%)" stroke="hsl(${hueB} 46% 84%)"/>
      <circle cx="326" cy="266" r="28" fill="hsl(${hueA} 72% 95%)" stroke="hsl(${hueA} 46% 84%)"/>
      <path d="M250 180l48-24M252 214l48 34M262 198h120" stroke="url(#accent)" stroke-width="8" stroke-linecap="round"/>
    `,
    systems: `
      <rect x="112" y="86" width="108" height="12" rx="6" fill="#111827" fill-opacity=".78"/>
      <rect x="116" y="132" width="108" height="78" rx="18" fill="#F8FAFC" stroke="#E5E7EB"/>
      <rect x="246" y="132" width="108" height="78" rx="18" fill="hsl(${hueA} 72% 96%)" stroke="hsl(${hueA} 52% 86%)"/>
      <rect x="376" y="132" width="108" height="78" rx="18" fill="hsl(${hueC} 72% 95%)" stroke="hsl(${hueC} 46% 84%)"/>
      <path d="M224 170h22M354 170h22" stroke="hsl(${hueB} 60% 48%)" stroke-width="8" stroke-linecap="round" stroke-dasharray="12 12"/>
      <rect x="198" y="242" width="204" height="56" rx="18" fill="#201b39"/>
      <rect x="228" y="264" width="144" height="10" rx="5" fill="#fff" fill-opacity=".9"/>
    `,
    workflow: `
      <rect x="108" y="88" width="92" height="12" rx="6" fill="#111827" fill-opacity=".78"/>
      <rect x="104" y="164" width="94" height="48" rx="18" fill="hsl(${hueA} 72% 96%)" stroke="hsl(${hueA} 52% 86%)"/>
      <rect x="252" y="164" width="94" height="48" rx="18" fill="hsl(${hueC} 72% 95%)" stroke="hsl(${hueC} 46% 84%)"/>
      <rect x="400" y="164" width="94" height="48" rx="18" fill="hsl(${hueB} 72% 96%)" stroke="hsl(${hueB} 46% 84%)"/>
      <path d="M198 188h54M346 188h54" stroke="url(#accent)" stroke-width="8" stroke-linecap="round"/>
      <circle cx="224" cy="188" r="8" fill="hsl(${hueA} 72% 56%)"/>
      <circle cx="372" cy="188" r="8" fill="hsl(${hueB} 66% 50%)"/>
    `,
    editorial: `
      <rect x="120" y="94" width="184" height="14" rx="7" fill="#111827" fill-opacity=".82"/>
      <rect x="120" y="132" width="360" height="8" rx="4" fill="#6B7280" fill-opacity=".42"/>
      <rect x="120" y="150" width="330" height="8" rx="4" fill="#6B7280" fill-opacity=".34"/>
      <rect x="120" y="168" width="346" height="8" rx="4" fill="#6B7280" fill-opacity=".34"/>
      <rect x="120" y="198" width="360" height="82" rx="20" fill="hsl(${hueA} 72% 96%)" stroke="hsl(${hueA} 52% 86%)"/>
      <rect x="120" y="198" width="6" height="82" rx="3" fill="url(#accent)"/>
      <rect x="146" y="220" width="130" height="8" rx="4" fill="url(#accent)"/>
      <rect x="146" y="240" width="290" height="8" rx="4" fill="#6B7280" fill-opacity=".38"/>
      <rect x="146" y="258" width="244" height="8" rx="4" fill="#6B7280" fill-opacity=".3"/>
    `,
    people: `
      <circle cx="188" cy="174" r="52" fill="hsl(${hueA} 72% 96%)" stroke="hsl(${hueA} 52% 86%)"/>
      <circle cx="300" cy="174" r="52" fill="hsl(${hueC} 72% 95%)" stroke="hsl(${hueC} 46% 84%)"/>
      <circle cx="412" cy="174" r="52" fill="hsl(${hueB} 72% 96%)" stroke="hsl(${hueB} 46% 84%)"/>
      <rect x="144" y="248" width="88" height="10" rx="5" fill="hsl(${hueA} 72% 58%)"/>
      <rect x="256" y="248" width="88" height="10" rx="5" fill="hsl(${hueC} 68% 58%)"/>
      <rect x="368" y="248" width="88" height="10" rx="5" fill="hsl(${hueB} 66% 52%)"/>
    `,
    data: `
      <rect x="114" y="88" width="92" height="12" rx="6" fill="#111827" fill-opacity=".78"/>
      <path d="M124 288h352" stroke="#E5E7EB" stroke-width="10" stroke-linecap="round"/>
      <rect x="146" y="${288 - barA}" width="56" height="${barA}" rx="16" fill="hsl(${hueA} 68% 72%)"/>
      <rect x="236" y="${288 - barB}" width="56" height="${barB}" rx="16" fill="hsl(${hueB} 70% 58%)"/>
      <rect x="326" y="${288 - barC}" width="56" height="${barC}" rx="16" fill="hsl(${hueC} 66% 64%)"/>
      <rect x="416" y="${288 - Math.max(36, barA - 10)}" width="56" height="${Math.max(36, barA - 10)}" rx="16" fill="hsl(${hueA} 58% 52%)"/>
    `,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" fill="none">${common}${scenes[theme] ?? scenes.product}</svg>`;
}

function resolveSource(src: string, seed: string) {
  if (src.startsWith("/")) {
    return src;
  }

  const theme = themeNames[src as keyof typeof themeNames] ?? themeNames.product;
  const svg = createArtwork(theme, seed);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function CardImage({
  src = themeNames.product,
  alt = "",
  className = "",
  seed = "",
}: CardImageProps) {
  const resolved = resolveSource(src, seed || alt || "qlugen");

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-muted/20 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolved}
        alt={alt}
        aria-hidden={alt ? undefined : "true"}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
