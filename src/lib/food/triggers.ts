export interface TriggerScanResultaat {
  triggers: string[];
  redenen: string[];
}

const SULFIETEN = [
  "sulfiet",
  "sulfur",
  "zwavel",
  "e220",
  "e221",
  "e222",
  "e223",
  "e224",
  "e225",
  "e226",
  "e227",
  "e228",
  "sulfur dioxide",
  "sodium sulfite",
  "potassium metabisulfite",
];

const LOOK_UI = [
  "ui",
  "knoflook",
  "look",
  "prei",
  "sjalot",
  "garlic",
  "onion",
  "leek",
  "shallot",
  "allium",
];

const KRUISBLOEMIGEN = [
  "broccoli",
  "bloemkool",
  "rucola",
  "kool", // Wordt hieronder extra gecontroleerd om koolzuur/koolhydraten uit te sluiten!
  "spruitjes",
  "boerenkool",
  "kale",
  "cabbage",
  "brussels sprout",
  "cruciferous",
];

const FOSFORZUUR = [
  "fosforzuur",
  "phosphoric acid",
  "e338",
  "e339",
  "e340",
  "e341",
  "e338-341",
];

const CONSERVEERMIDDELEN = [
  "conserveermiddel",
  "preservative",
  "sorbinezuur",
  "sorbic acid",
  "benzoëzuur",
  "benzoic acid",
  "e200",
  "e202",
  "e211",
  "e212",
];

const KLEURSTOFFEN = [
  "kleurstof",
  "coloring",
  "e100",
  "e102",
  "e104",
  "e110",
  "e122",
  "e124",
  "e129",
  "e131",
  "e132",
  "e133",
  "e150",
  "e150a",
  "e150b",
  "e150c",
  "e150d",
  "caramel",
  "e150-150d",
];

const KOELZUUR = [
  "koolzuur",
  "carbonic acid",
  "carbon dioxide",
  "co2",
  "bruisend",
  "sparkling",
  "carbonated",
];

const ALLE_TRIGGERS: Array<{ naam: string; patronen: string[]; reden: string }> = [
  { naam: "sulfieten", patronen: SULFIETEN, reden: "bevat sulfieten / zwavelverbindingen -> belast SUOX" },
  { naam: "verborgen look/ui", patronen: LOOK_UI, reden: "bevat look/ui -> zwavelverbindingen belasten SUOX" },
  { naam: "kruisbloemig", patronen: KRUISBLOEMIGEN, reden: "bevat kruisbloemige groente -> zwavelrijk, belast SUOX" },
  { naam: "fosforzuur", patronen: FOSFORZUUR, reden: "bevat fosforzuur -> belast lever-fase-2-klaring (SULT)" },
  { naam: "conserveermiddelen", patronen: CONSERVEERMIDDELEN, reden: "bevat conserveermiddelen -> darmbarrière en lever belasten (SULT)" },
  { naam: "kleurstoffen", patronen: KLEURSTOFFEN, reden: "bevat synthetische kleurstoffen -> lever-fase-2 belasten (SULT)" },
  { naam: "koolzuur", patronen: KOELZUUR, reden: "bevat koolzuur -> prikkelt maag/darmbarrière en belast lever (SULT)" },
];

export function scanIngredienten(tekst: string): TriggerScanResultaat {
  const triggers: string[] = [];
  const redenen: string[] = [];
  const lower = tekst.toLowerCase();

  for (const group of ALLE_TRIGGERS) {
    let matchGevonden = false;

    for (const patroon of group.patronen) {
      if (lower.includes(patroon.toLowerCase())) {
        // SLIMME BEVEILIGING VOOR "KOOL" IN HET HOOFDBESTAND
        if (patroon === "kool") {
          const isKoolzuurOfKoolhydraat =
            lower.includes("koolzuur") ||
            lower.includes("koolhydrat") ||
            lower.includes("koolstof");

          if (isKoolzuurOfKoolhydraat) {
            // Controleer of er wel een ECHTE koolsoort in de ingrediënten staat
            const heeftEchteKool =
              /(boerenkool|spitskool|zuurkool|rode\s?kool|witte\s?kool|groene\s?kool|\bkool\b)/i.test(lower);
            if (!heeftEchteKool) {
              continue; // Sla deze match over, het is geen groente!
            }
          }
        }

        matchGevonden = true;
        break;
      }
    }

    if (matchGevonden) {
      if (!triggers.includes(group.naam)) {
        triggers.push(group.naam);
        redenen.push(group.reden);
      }
    }
  }

  return { triggers, redenen };
}
