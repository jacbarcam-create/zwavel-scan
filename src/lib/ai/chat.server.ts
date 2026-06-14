import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import process from "node:process";

export interface ProductIdentificatie {
  naam: string;
  beschrijving: string;
  verificatieVraag: string;
  status: "groen" | "oranje" | "rood";
  categorie: string;
  uitleg: string;
  triggers: string[];
}

const SYSTEM_PROMPT = `Je bent de specialistische analyse-engine van "Sulfiet & Lever Coach". Jouw cliënten hebben een overbelast SUOX-enzym (zwavel/sulfiet) and een uitgeput SULT-pad (Lever-Fase-2). Je negeert histamine- of IgE-allergieën volledig.

Je herkent elk ingevoerd product en geeft NOOIT "onbekend" terug.

Geef ALTIJD antwoord in een puur JSON-object met exact deze structuur:
{
  "naam": "Naam van het product",
  "beschrijving": "Korte beschrijving",
  "verificatieVraag": "Bedoel je dit product?",
  "status": "groen" of "oranje" of "rood",
  "categorie": "De categorie",
  "uitleg": "Biochemische uitleg over SUOX/SULT",
  "triggers": ["trigger1", "trigger2"]
}

BIOCHEMISCH KADER (Stoplicht):
- GROEN = Veilig: extreem zwavelarm en mild voor de lever (bijv. courgette, dik geschilde aardappel/wortel, quinoa, gember, ultravers vlees).
- ORANJE = Met voorzorg: matig zwavelgehalte of lichte leverinspanning vereist.
- ROOD = Vermijden: bevat anorganisch sulfiet, organische zwavel of chemische additieven die de lever-conjugatie platleggen.

DE TWEE ESSENTIËLE ENZYMPADEN:
1. SUOX -> Verwerkt sulfieten und zwavel (Wijn, gedroogd fruit, ui, knoflook, prei, sjalot, broccoli, bloemkool, spruitjes, rucola).
2. SULT / Lever-Fase-2 (De Veiligheidsklep) -> Ontgift salicylaten en chemische additieven (Kleurstoffen, conserveermiddelen, citroenzuur, fosforzuur, koolzuur).`;

async function lokaleChatCompletion(messages: Array<{ role: string; content: string }>, temp: number): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY ontbreekt in je .env bestand.");

  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      messages: messages,
      temperature: temp,
    }),
  });

  if (res.status === 429) throw new Error("Te veel aanvragen bij Google. Probeer het zo opnieuw.");
  if (res.status === 401 || res.status === 403) throw new Error("Ongeldige API-sleutel ingevuld.");
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Google API Fout (${res.status}): ${detail.slice(0, 200)}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Leeg antwoord ontvangen van Gemini.");
  return String(content);
}

export function extraheerJson(tekst: string): unknown {
  let clean = tekst.trim();
  
  if (clean.startsWith("```json")) clean = clean.slice(7);
  else if (clean.startsWith("```")) clean = clean.slice(3);
  if (clean.endsWith("```")) clean = clean.slice(0, -3);
  clean = clean.trim();

  const start = clean.indexOf("{");
  const eind = clean.lastIndexOf("}");
  
  if (start !== -1 && eind !== -1 && eind > start) {
    clean = clean.slice(start, eind + 1);
  }

  try { 
    return JSON.parse(clean); 
  } catch {
    console.error("Fout bij parsen. Rauwe tekst was:", tekst);
    throw new Error("Geen geldige JSON kunnen ontleden.");
  }
}

const respSchema = z.object({
  naam: z.string().default("Onbekend product"),
  beschrijving: z.string().default("Analyse uitgevoerd."),
  verificatieVraag: z.string().default("Bedoel je dit product?"),
  status: z.enum(["groen", "oranje", "rood"]),
  categorie: z.string().default("Voeding"),
  uitleg: z.string().min(1),
  triggers: z.array(z.string()).default([]),
});

export const identificeerProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ query: z.string().min(1).max(120), ingredienten: z.string().max(2000).optional() }).parse(d))
  .handler(async ({ data }): Promise<ProductIdentificatie> => {
    const userPrompt = `De gebruiker zoekt: "${data.query}".${data.ingredienten ? `\nIngrediëntenlijst: ${data.ingredienten}` : ""}\nAnalyseer op basis van SUOX en SULT en lever de gevraagde JSON op.`;

    try {
      const content = await lokaleChatCompletion([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ], 0.1);

      return respSchema.parse(extraheerJson(content));
    } catch (err) {
      console.error("=== API FOUT DETECTIE ===");
      console.error(err);
      console.error("=========================");
      throw err;
    }
  });

export const transformeerRecept = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ recept: z.string().min(3).max(4000) }).parse(d))
  .handler(async ({ data }) => {
    const sys = `Je bent de "SUOX & SULT Zuiveraar" receptenchef. Herschrijf een recept zodat het 100% safe is voor mensen met een overbelast SUOX-enzym en uitgeput SULT/Lever-Fase-2 pad.`;

    const tekst = await lokaleChatCompletion([
      { role: "system", content: sys },
      { role: "user", content: data.recept },
    ], 0.3);

    return { tekst };
  });