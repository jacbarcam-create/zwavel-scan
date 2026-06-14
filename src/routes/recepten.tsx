import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ChefHat, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { transformeerRecept } from "@/lib/food/identify.functions";

export const Route = createFileRoute("/recepten")({
  head: () => ({
    meta: [
      { title: "Recepten herschrijven — SUOX & SULT Zuiveraar" },
      { name: "description", content: "Plak een recept en laat de AI look, ui, kruisbloemigen en chemische zuren vervangen door SUOX- en SULT-veilige alternatieven." },
      { property: "og:title", content: "Recepten herschrijven — SUOX & SULT Zuiveraar" },
      { property: "og:description", content: "Herschrijf recepten naar sulfiet- en levervriendelijke varianten." },
      { property: "og:url", content: "https://zwavel-scan.lovable.app/recepten" },
    ],
    links: [{ rel: "canonical", href: "https://zwavel-scan.lovable.app/recepten" }],
  }),
  component: ReceptenPage,
});

function ReceptenPage() {
  const transform = useServerFn(transformeerRecept);
  const [recept, setRecept] = useState("");
  const [out, setOut] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (!recept.trim()) return;
    setLoading(true); setError(null); setOut(null);
    try {
      const r = await transform({ data: { recept } });
      setOut(r.tekst);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-3xl font-semibold">Zuiver je recept</h2>
        <p className="text-muted-foreground text-sm">
          Plak een recept. De AI vervangt look, ui, kruisbloemigen, conserveermiddelen en chemische zuren door SUOX- en SULT-veilige alternatieven.
        </p>
      </section>

      <form onSubmit={go} className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
        <Textarea
          placeholder="Plak hier je originele recept met ingrediënten en bereiding…"
          value={recept}
          onChange={(e) => setRecept(e.target.value)}
          className="min-h-40"
          maxLength={4000}
        />
        <Button type="submit" disabled={loading || !recept.trim()} className="w-full">
          {loading ? <><Loader2 className="animate-spin" /> Herschrijven…</> : <><ChefHat /> Maak veilig</>}
        </Button>
      </form>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <AlertCircle className="size-4 mt-0.5 text-destructive" />
          <p>{error}</p>
        </div>
      )}

      {out && (
        <article className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Gezuiverde versie</h3>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/85">{out}</pre>
        </article>
      )}
    </div>
  );
}
