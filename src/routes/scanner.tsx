import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { identificeerProduct, type ProductIdentificatie } from "@/lib/food/identify.functions";
import { scanIngredienten } from "@/lib/food/triggers";
import { zoekInDatabase } from "@/lib/food/database";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Scan een product — SUOX & SULT Zuiveraar" },
      { name: "description", content: "Typ een product of plak een ingrediëntenlijst en ontdek direct of het je SUOX- (zwavel) of SULT-pad (lever-fase-2) belast." },
      { property: "og:title", content: "Scan een product — SUOX & SULT Zuiveraar" },
      { property: "og:description", content: "Beoordeel voeding op sulfiet- en leverbelasting via een helder stoplichtsysteem." },
    ],
  }),
  component: ScannerPage,
});

function ScannerPage() {
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
        <h2 className="text-3xl font-semibold">Scan via camera of barcode</h2>
        <p className="text-muted-foreground text-sm">
          Voer hieronder de gegevens in om de camera-analyse te simuleren voor je <span className="text-sulfur font-medium">SUOX-enzym</span>.
        </p>
      </section>

      <form onSubmit={handleScan} className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium">Product of Barcode</span>
          <Input
            placeholder="Scan of typ product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-1"
            maxLength={120}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Ingrediënten Scannen</span>
          <Textarea
            placeholder="Resultaat van de scan..."
            value={ingredienten}
            onChange={(e) => setIngredienten(e.target.value)}
            className="mt-1 min-h-24"
            maxLength={2000}
          />
        </label>

        <Button type="submit" disabled={loading || !query.trim()} className="w-full">
          {loading ? <><Loader2 className="animate-spin" /> Scannen…</> : <><Search /> Start Scan</>}
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
        </article>
      )}
    </div>
  );
}