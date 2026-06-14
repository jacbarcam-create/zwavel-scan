import { Link, useRouterState } from "@tanstack/react-router";
import { Search, BookOpen, NotebookPen, Camera } from "lucide-react";
import type { ReactNode } from "react";

const items = [
  { to: "/", label: "Scan", icon: Search },
  { to: "/scanner", label: "Barcode", icon: Camera },
  { to: "/recepten", label: "Recepten", icon: BookOpen },
  { to: "/dagboek", label: "Dagboek", icon: NotebookPen },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto max-w-2xl px-5 py-4 flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-br from-liver to-sulfur shadow-sm" />
          <div>
            <h1 className="text-base font-semibold leading-none">SUOX &amp; SULT Zuiveraar</h1>
            <p className="text-xs text-muted-foreground mt-1">Sulfiet- en leverbewust eten</p>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-5 py-6 pb-28">
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-2xl grid grid-cols-4">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                  active ? "text-sulfur" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.5 : 1.8} />
                <span className={active ? "font-semibold" : ""}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
