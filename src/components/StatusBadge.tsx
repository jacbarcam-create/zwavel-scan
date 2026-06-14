import type { Status } from "@/lib/food/database";

export function StatusBadge({ status }: { status: Status }) {
  const map = {
    groen: { label: "GROEN — Veilig", cls: "bg-[color:var(--status-green)] text-white" },
    oranje: { label: "ORANJE — Met voorzorg", cls: "bg-[color:var(--status-amber)] text-black" },
    rood: { label: "ROOD — Vermijden", cls: "bg-[color:var(--status-red)] text-white" },
  } as const;
  const v = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${v.cls}`}>
      {v.label}
    </span>
  );
}
