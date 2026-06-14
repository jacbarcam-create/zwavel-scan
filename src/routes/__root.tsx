import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import appCss from "../styles.css?url";
import { AppShell } from "../components/AppShell";

const queryClient = new QueryClient();

const SITE_URL = "https://zwavel-scan.lovable.app";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SUOX & SULT Zuiveraar — Sulfiet- en leverbewust" },
      { name: "description", content: "Nederlandse voedingscoach die producten en recepten beoordeelt op sulfiet (SUOX) en lever-fase-2 (SULT) belasting." },
      { property: "og:site_name", content: "SUOX & SULT Zuiveraar" },
      { property: "og:title", content: "SUOX & SULT Zuiveraar — Sulfiet- en leverbewust" },
      { name: "twitter:title", content: "SUOX & SULT Zuiveraar — Sulfiet- en leverbewust" },
      { property: "og:description", content: "Beoordeel voeding en recepten op SUOX- (zwavel) en SULT-belasting (lever-fase-2)." },
      { name: "twitter:description", content: "Beoordeel voeding en recepten op SUOX- (zwavel) en SULT-belasting (lever-fase-2)." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d2221028-776f-48d2-ac24-4a308b8a38de/id-preview-5c9fe6e9--7ab6c0ff-078b-4ab6-a83b-d2b6ff5705f9.lovable.app-1781083232130.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d2221028-776f-48d2-ac24-4a308b8a38de/id-preview-5c9fe6e9--7ab6c0ff-078b-4ab6-a83b-d2b6ff5705f9.lovable.app-1781083232130.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SUOX & SULT Zuiveraar",
          url: SITE_URL,
          description: "Nederlandse voedingscoach voor mensen met sulfiet- (SUOX) en lever-fase-2 (SULT) gevoeligheid.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SUOX & SULT Zuiveraar",
          url: SITE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <AppShell>
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold">Pagina niet gevonden</h2>
        <p className="text-muted-foreground mt-2">Deze pagina bestaat niet.</p>
      </div>
    </AppShell>
  ),
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Outlet />
      </AppShell>
    </QueryClientProvider>
  );
}
