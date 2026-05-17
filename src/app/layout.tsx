import './globals.css'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script';
import { Outfit } from "next/font/google";

export const metadata: Metadata = {
  title: 'Qlugen - AI Development Agency',
  description: 'Qlugen designs, builds, and ships AI products, agents, automations, and integrations for growing teams.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <Script id="strip-fdprocessedid" strategy="beforeInteractive">
          {`
            (() => {
              const strip = (root) => {
                const nodes = root.querySelectorAll?.('[fdprocessedid]');
                if (!nodes) return;
                nodes.forEach((node) => node.removeAttribute('fdprocessedid'));
              };

              strip(document);

              const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                  if (mutation.type === 'attributes' && mutation.attributeName === 'fdprocessedid') {
                    mutation.target.removeAttribute('fdprocessedid');
                  }
                  if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                      if (node?.nodeType === Node.ELEMENT_NODE) {
                        strip(node);
                      }
                    });
                  }
                }
              });

              observer.observe(document.documentElement, {
                subtree: true,
                childList: true,
                attributes: true,
                attributeFilter: ['fdprocessedid'],
              });
            })();
          `}
        </Script>
      </head>
      <body
        suppressHydrationWarning
        className={`${outfit.className} ${outfit.variable} flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground antialiased`}
      >
        <main className="flex-1 w-full">
          {children}
        </main>
      </body>
    </html>
  )
}
