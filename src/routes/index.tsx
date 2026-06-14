import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, Loader2, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { identificeerProduct, type ProductIdentificatie } from "@/lib/food/identify.functions";
import { scanIngredienten } from "@/lib/food/triggers";
import { zoekInDatabase } from "@/lib/food/database";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scan een product — SUOX & SULT Zuiveraar" },
      { name: "description", content: "Typ een product of plak een ingrediëntenlijst en ontdek direct of het je SUOX- (zwavel) of SULT-pad (lever-fase-2) belast." },
      { property: "og:title", content: "Scan een product — SUOX & SULT Zuiveraar" },
      { property: "og:description", content: "Beoordeel voeding op sulfiet- en leverbelasting via een helder stoplichtsysteem." },
      { property: "og:url", content: "https://zwavel-scan.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://zwavel-scan.lovable.app/" }],
  }),
  component: ScanPage,
});

function ScanPage() {
  const identify = useServerFn(identificeerProduct);
  const [query, setQuery] = useState("");
  const [ingredienten, setIngredienten] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductIdentificatie | null>(null);
  const [localTriggers, setLocalTriggers] = useState<{ triggers: string[]; redenen: string[] } | null>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(null); setResult(null); setLocalTriggers(null);

    const localScan = scanIngredienten(`${query} ${ingredienten}`);
    setLocalTriggers(localScan);

    const local = zoekInDatabase(query);
    if (local) {
      setResult({
        naam: query,
        beschrijving: "Direct herkend in lokale SUOX/SULT-database.",
        verificatieVraag: "Bedoel je dit product?",
        status: local.status,
        categorie: local.categorie,
        uitleg: local.uitleg,
        triggers: localScan.triggers,
        alternatieven: (local as any).alternatieven ?? [], // Veilige fallback voor de lokale DB
      });
      setLoading(false);
      return;
    }

    try {
      const res = await identify({ data: { query, ingredienten: ingredienten || undefined } });
      const merged: ProductIdentificatie = {
        ...res,
        triggers: Array.from(new Set([...(res.triggers ?? []), ...localScan.triggers])),
      };
      if (localScan.triggers.length > 0 && merged.status === "groen") merged.status = "oranje";
      setResult(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-3xl font-semibold">Scan je product</h2>
        <p className="text-muted-foreground text-sm">
          Beoordeel direct of een voedingsmiddel je <span className="text-sulfur font-medium">SUOX-enzym</span> (zwavel) of <span className="text-liver font-medium">Lever-Fase-2 (SULT)</span> belast.
        </p>
      </section>

      <form onSubmit={handleScan} className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium">Productnaam</span>
          <Input
            placeholder="bijv. courgette, kipfilet, witte wijn, cola"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-1"
            maxLength={120}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Ingrediëntenlijst <span className="text-muted-foreground font-normal">(optioneel)</span></span>
          <Textarea
            placeholder="Plak hier de ingrediëntenlijst van de verpakking…"
            value={ingredienten}
            onChange={(e) => setIngredienten(e.target.value)}
            className="mt-1 min-h-24"
            maxLength={2000}
          />
        </label>

        <Button type="submit" disabled={loading || !query.trim()} className="w-full">
          {loading ? <><Loader2 className="animate-spin" /> Analyseren…</> : <><Search /> Analyseer</>}
        </Button>
      </form>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <AlertCircle className="size-4 mt-0.5 text-destructive" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <article className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">{result.naam}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">{result.categorie}</p>
            </div>
            <StatusBadge status={result.status} />
          </div>

          <p className="text-sm text-foreground/80">{result.beschrijving}</p>

          <div className="rounded-xl bg-muted p-4 text-sm leading-relaxed">
            <p className="font-medium mb-1">Biochemische uitleg</p>
            <p className="text-foreground/80">{result.uitleg}</p>
          </div>

          {/* NIEUW: Het Advies & Alternatieven blokje */}
          {result.alternatieven && result.alternatieven.length > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm leading-relaxed">
              <div className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                <Lightbulb className="size-4" />
                <span>Veilig alternatief of advies</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-foreground/90 font-medium">
                {result.alternatieven.map((alt, index) => (
                  <li key={index}>{alt}</li>
                ))}
              </ul>
            </div>
          )}

          {result.triggers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Gedetecteerde triggers</p>
              <div className="flex flex-wrap gap-2">
                {result.triggers.map((t) => (
                  <span key={t} className="rounded-full bg-sulfur-soft text-sulfur px-3 py-1 text-xs font-medium">{t}</span>
                ))}
              </div>
              {localTriggers && localTriggers.redenen.length > 0 && (
                <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
                  {localTriggers.redenen.map((r) => <li key={r}>{r}</li>)}
                </ul>
              )}
            </div>
          )}

          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground italic">{result.verificatieVraag}</p>
          </div>
        </article>
      )}
    </div>
  );
}