export type Status = "groen" | "oranje" | "rood";

export interface FoodEntry {
  keywords: string[];
  status: Status;
  categorie: string;
  uitleg: string;
}

export const foodDatabase: FoodEntry[] = [
  {
    keywords: ["kipfilet", "verse kip", "kalkoen"],
    status: "groen",
    categorie: "Vlees & Gevogelte",
    uitleg: "GROEN. Arm aan actieve zwavelverbindingen en zeer mild voor de lever."
  },
  {
    keywords: ["rundvlees", "biefstuk", "tartaar"],
    status: "groen",
    categorie: "Vlees & Gevogelte",
    uitleg: "GROEN. Rundvlees is veilig en bevat geen anorganische sulfieten."
  },
  {
    keywords: ["eigeel", "eidooier"],
    status: "groen",
    categorie: "Eigeel",
    uitleg: "GROEN. Eigeel ondersteunt de Fase 2-ontgifting van de lever. Let op: vermijd het eiwit."
  },
  {
    keywords: ["aardappel", "aardappelen"],
    status: "groen",
    categorie: "Knol (dik geschild)",
    uitleg: "GROEN (MITS DIK GESCHILD). Schil minimaal 2-3 mm om salicylaten en plantenafweerstoffen te verwijderen."
  },
  {
    keywords: ["courgette"],
    status: "groen",
    categorie: "Groente (dik geschild)",
    uitleg: "GROEN (MITS DIK GESCHILD). Vrijwel zwavelvrij en zeer licht verteerbaar voor de lever."
  },
  {
    keywords: ["gember", "gemberthee"],
    status: "groen",
    categorie: "Ondersteunend",
    uitleg: "GROEN. Ondersteunt de leverontgifting en remt ontstekingen zonder het SUOX-pad te belasten."
  },
  {
    keywords: ["ui", "uien", "knoflook", "prei", "sjalot"],
    status: "rood",
    categorie: "Lookfamilie",
    uitleg: "ROOD. Extreem rijk aan organische zwavelverbindingen. Directe overbelasting van het SUOX-pad."
  },
  {
    keywords: ["broccoli", "bloemkool", "rucola", "kool", "spruitjes"],
    status: "rood",
    categorie: "Kruisbloemigen",
    uitleg: "ROOD. Bevat glucosinolaten (zwavelverbindingen) die het SUOX-pad zwaar belasten."
  },
  {
    keywords: ["cola", "frisdrank", "fanta", "sprite"],
    status: "rood",
    categorie: "Frisdrank",
    uitleg: "ROOD. Bevat fosforzuur en chemische additieven die de Lever-Fase-2 (SULT) zwaar uitputten."
  }
];

export function zoekInDatabase(query: string): FoodEntry | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  for (const entry of foodDatabase) {
    for (const k of entry.keywords) {
      if (q.includes(k.toLowerCase()) || k.toLowerCase().includes(q)) {
        return entry;
      }
    }
  }
  return null;
}
