import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import type { Status } from "@/lib/food/database";
import { scanIngredienten } from "@/lib/food/triggers";

export const Route = createFileRoute("/dagboek")({
  head: () => ({
    meta: [
      { title: "Eetdagboek — SUOX & SULT Zuiveraar" },
      { name: "description", content: "Houd lokaal bij wat je at, met automatische triggerdetectie voor sulfiet en lever-fase-2 belasting." },
      { property: "og:title", content: "Eetdagboek — SUOX & SULT Zuiveraar" },
      { property: "og:description", content: "Een privé eetdagboek dat triggers voor SUOX en SULT herkent." },
      { property: "og:url", content: "https://zwavel-scan.lovable.app/dagboek" },
    ],
    links: [{ rel: "canonical", href: "https://zwavel-scan.lovable.app/dagboek" }],
  }),
  component: DagboekPage,
});

interface DagboekItem {
  id: string;
  datum: string;
  naam: string;
  notitie: string;
  status: Status;
  triggers: string[];
}

const KEY = "suox_sult_dagboek_v1";

function load(): DagboekItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

function DagboekPage() {
  const [items, setItems] = useState<DagboekItem[]>([]);
  const [naam, setNaam] = useState("");
  const [notitie, setNotitie] = useState("");
  const [status, setStatus] = useState<Status>("groen");

  useEffect(() => { setItems(load()); }, []);

  function save(next: DagboekItem[]) {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!naam.trim()) return;
    const scan = scanIngredienten(`${naam} ${notitie}`);
    const item: DagboekItem = {
      id: crypto.randomUUID(),
      datum: new Date().toISOString(),
      naam: naam.trim(),
      notitie: notitie.trim(),
      status,
      triggers: scan.triggers,
    };
    save([item, ...items]);
    setNaam(""); setNotitie(""); setStatus("groen");
  }

  function remove(id: string) { save(items.filter((i) => i.id !== id)); }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-3xl font-semibold">Eetdagboek</h2>
        <p className="text-muted-foreground text-sm">
          Houd bij wat je at en hoe je SUOX- en SULT-belasting voelde. Lokaal opgeslagen, blijft op je apparaat.
        </p>
      </section>

      <form onSubmit={add} className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
        <Input placeholder="Wat at je? (bijv. kipfilet met courgette)" value={naam} onChange={(e) => setNaam(e.target.value)} />
        <Textarea placeholder="Notitie of ingrediënten…" value={notitie} onChange={(e) => setNotitie(e.target.value)} className="min-h-20" />
        <div className="flex gap-2">
          {(["groen", "oranje", "rood"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex-1 rounded-lg border py-2 text-xs font-semibold capitalize transition ${
                status === s ? "border-sulfur bg-sulfur-soft" : "border-border bg-background"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <Button type="submit" disabled={!naam.trim()} className="w-full"><Plus /> Toevoegen</Button>
      </form>

      <section className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">Nog geen items in je dagboek.</p>
        )}
        {items.map((i) => (
          <article key={i.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{i.naam}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(i.datum).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <StatusBadge status={i.status} />
            </div>
            {i.notitie && <p className="text-sm mt-2 text-foreground/80">{i.notitie}</p>}
            {i.triggers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {i.triggers.map((t) => (
                  <span key={t} className="rounded-full bg-sulfur-soft text-sulfur px-2 py-0.5 text-[11px] font-medium">{t}</span>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(i.id)}>
                <Trash2 /> Verwijderen
              </Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
