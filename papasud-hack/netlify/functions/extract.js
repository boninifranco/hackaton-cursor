// netlify/functions/extract.js
//
// Recibe { texto, tipo } y devuelve JSON estructurado.
// tipo: "stock" | "orden" | "consulta" | "discrepancia"
//
// Necesita la variable de entorno GROQ_API_KEY configurada en Netlify
// (Site settings -> Environment variables)

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";

// ---- Normalización determinística de ubicaciones ----
// No depende de que la IA interprete bien errores de tipeo o de
// transcripción de voz — lo resolvemos con código, más confiable.
const UBICACIONES = ["Dospanca", "Galpón", "Frigopap"];

function sinAcentos(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizarUbicacion(raw) {
  if (!raw) return null;
  const r = sinAcentos(raw.trim());

  if (r.includes("galp") || r.includes("galo") || r === "galon") return "Galpón";
  if (r.includes("dospa") || r.includes("dos pa") || r.includes("despan")) return "Dospanca";
  if (r.includes("frigo")) return "Frigopap";

  // último intento: coincidencia parcial contra el nombre real
  for (const u of UBICACIONES) {
    if (sinAcentos(u).includes(r) || r.includes(sinAcentos(u).slice(0, 4))) {
      return u;
    }
  }

  return raw; // no matcheó ninguna, dejamos el valor original tal cual vino
}

// ---- Prompts por vertical ----

const SCHEMAS = {
  stock: {
    system: `Sos un asistente que convierte texto libre en español (hablado o escrito por un operario de campo) en un movimiento de stock estructurado, para una empresa de semilla de papa.

Devolvé SOLO un objeto JSON válido, sin texto adicional, sin markdown, con esta forma exacta:
{
  "tipo": "ingreso" | "egreso",
  "variedad": string,
  "lote": string,
  "kg": number,
  "bolsas": number | null,
  "origen": string | null,
  "destino": string | null,
  "cliente": string | null,
  "remito": number | null,
  "confianza": "alta" | "media" | "baja",
  "campos_faltantes": string[]
}

Reglas:
- "ingreso" es cuando el producto entra a una ubicación (ej: del campo a un frigorífico). En un ingreso, la ubicación mencionada va SIEMPRE en el campo "destino", nunca en "origen".
- "egreso" es cuando el producto sale de una ubicación (ej: a un cliente). En un egreso, la ubicación mencionada va SIEMPRE en el campo "origen", nunca en "destino".
- Las ubicaciones válidas son: Dospanca, Galpón, Frigopap.
- Sé tolerante a errores de tipeo, acentos faltantes o transcripción de voz.
  Si el texto menciona una ubicación que suena parecida a una de las tres
  (aunque esté mal escrita o incompleta), asumí que es esa. Solo dejá el
  campo en null si realmente no se menciona ninguna ubicación.
- Si un dato no está en el texto, poné null y agregalo a "campos_faltantes".
- "confianza" es "baja" si tuviste que inferir datos importantes, "alta" si todo estaba explícito.
- Nunca inventes números. Si no aparece un kg o lote, es null.`,
    example: `Ejemplo 1 (ingreso):
Texto: "Ingresaron 35000 kilos de king russet al galpón, lote 1585"
JSON: {"tipo":"ingreso","variedad":"King Russet","lote":"1585","kg":35000,"bolsas":null,"origen":null,"destino":"Galpón","cliente":null,"remito":null,"confianza":"alta","campos_faltantes":["bolsas","remito"]}

Ejemplo 2 (egreso):
Texto: "Salieron 28380 kilos de king russet lote 910 del galpón para wemar mc cain, remito 674"
JSON: {"tipo":"egreso","variedad":"King Russet","lote":"910","kg":28380,"bolsas":null,"origen":"Galpón","destino":null,"cliente":"Wemar - Mc Cain","remito":674,"confianza":"alta","campos_faltantes":["bolsas"]}`
  },

  orden: {
    system: `Sos un asistente que convierte texto libre en español (hablado por un ingeniero agrónomo en el campo) en una orden de trabajo estructurada.

Devolvé SOLO un objeto JSON válido, sin texto adicional, sin markdown, con esta forma exacta:
{
  "lote": string,
  "pivote": string | null,
  "tarea": string,
  "insumo": string | null,
  "dosis_por_ha": number | null,
  "superficie_ha": number | null,
  "herramienta": string | null,
  "fecha": string | null,
  "confianza": "alta" | "media" | "baja",
  "campos_faltantes": string[]
}

Reglas:
- "tarea" describe qué se hizo (ej: "aplicación de fungicida", "riego", "fumigación").
- Si no hay fecha explícita, poné null.
- Nunca inventes dosis o superficies que no estén en el texto.`,
    example: `Ejemplo:
Texto: "Apliqué fungicida Dithane en el lote 34B del pivote B, dosis 2.5 por hectárea, con drone, el 11 de noviembre"
JSON: {"lote":"34B","pivote":"B","tarea":"aplicación de fungicida","insumo":"Dithane","dosis_por_ha":2.5,"superficie_ha":null,"herramienta":"drone","fecha":"2026-11-11","confianza":"alta","campos_faltantes":["superficie_ha"]}`
  },

  consulta: {
    system: `Sos un asistente que responde preguntas sobre datos históricos de producción de semilla de papa, USANDO EXCLUSIVAMENTE los datos que se te dan como contexto. Nunca inventes números.

Devolvé SOLO un objeto JSON válido, sin texto adicional, sin markdown, con esta forma exacta:
{
  "respuesta": string,
  "datos_usados": object[],
  "encontrado": boolean
}

Reglas:
- Si la pregunta no se puede responder con los datos provistos, "encontrado" es false y "respuesta" lo explica.
- "datos_usados" debe contener las filas/registros exactos del contexto que soportan la respuesta.
- Nunca calcules ni inventes cifras que no estén en el contexto.`,
    example: null
  },

  discrepancia: {
    system: `Sos un asistente que analiza discrepancias entre el stock declarado en un sistema y un conteo físico real, para una empresa de semilla de papa.

Devolvé SOLO un objeto JSON válido, sin texto adicional, sin markdown, con esta forma exacta:
{
  "hay_discrepancia": boolean,
  "diferencia_kg": number,
  "hipotesis": string
}

Reglas:
- "diferencia_kg" es contado - declarado (positivo si sobra, negativo si falta).
- Si la diferencia es 0, "hay_discrepancia" es false y la hipótesis dice que coinciden.
- La "hipotesis" debe ser una frase corta y simple explicando la causa más probable
  (ej: "un movimiento de salida posiblemente no se registró en el sistema" o
  "un ingreso posiblemente se cargó con menos kilos de los reales").
- Nunca inventes remitos o fechas específicas que no te den como dato.`,
    example: `Ejemplo:
Texto: "Declarado: 60420 kg. Contado físicamente: 26640 kg. Variedad King Russet, lote 910, ubicación Galpón."
JSON: {"hay_discrepancia":true,"diferencia_kg":-33780,"hipotesis":"Falta stock respecto a lo declarado — un movimiento de salida de King Russet lote 910 posiblemente no se registró en el sistema."}`
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { texto, tipo, contexto } = JSON.parse(event.body);

    if (!texto || !tipo || !SCHEMAS[tipo]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan 'texto' o 'tipo' válido (stock | orden | consulta | discrepancia)" })
      };
    }

    const schema = SCHEMAS[tipo];

    const messages = [
      { role: "system", content: schema.system + (schema.example ? "\n\n" + schema.example : "") }
    ];

    // La vertical "consulta" necesita datos históricos como contexto verificable
    if (tipo === "consulta" && contexto) {
      messages.push({
        role: "system",
        content: `Contexto de datos reales (usá solo esto para responder):\n${JSON.stringify(contexto)}`
      });
    }

    messages.push({ role: "user", content: texto });

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0,
        max_completion_tokens: 1024,
        reasoning_effort: "low",
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: "Groq API error", detail: errText }) };
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return { statusCode: 502, body: JSON.stringify({ error: "La IA no devolvió JSON válido", raw }) };
    }

    // Normalizamos ubicaciones y corregimos origen/destino con código,
    // no dependemos de que la IA lo haga perfecto siempre.
    if (tipo === "stock") {
      if (parsed.origen) parsed.origen = normalizarUbicacion(parsed.origen);
      if (parsed.destino) parsed.destino = normalizarUbicacion(parsed.destino);

      // Corrige cuando la IA confunde origen/destino:
      // en un ingreso la ubicación va en "destino", en un egreso va en "origen"
      if (parsed.tipo === "ingreso" && !parsed.destino && parsed.origen) {
        parsed.destino = parsed.origen;
        parsed.origen = null;
      }
      if (parsed.tipo === "egreso" && !parsed.origen && parsed.destino) {
        parsed.origen = parsed.destino;
        parsed.destino = null;
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
