import { useState } from "react";
import { useSpeechToText } from "./useSpeechToText";
import { usePersistedState } from "./usePersistedState";
import { historicalData } from "./historicalData";
import "./App.css";

type Tab = "stock" | "orden" | "consulta";

type StockExtraction = {
  tipo: "ingreso" | "egreso";
  variedad: string;
  lote: string;
  kg: number;
  bolsas: number | null;
  origen: string | null;
  destino: string | null;
  cliente: string | null;
  remito: number | null;
  confianza: "alta" | "media" | "baja";
  campos_faltantes: string[];
};

type Movimiento = StockExtraction & { id: number; textoOriginal: string };

async function extract(texto: string, tipo: Tab | "discrepancia", contexto?: any) {
  const res = await fetch("/.netlify/functions/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto, tipo, contexto }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Botón de mic reusable
function MicButton({
  listening,
  supported,
  onClick,
}: {
  listening: boolean;
  supported: boolean;
  onClick: () => void;
}) {
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={listening ? "mic-btn listening" : "mic-btn"}
    >
      {listening ? "🔴 Escuchando..." : "🎤 Hablar"}
    </button>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("stock");

  return (
    <div className="app">
      <header className="app-header">
        <h1>Papasud — Copiloto de operación</h1>
        <nav className="tabs">
          <button
            className={tab === "stock" ? "active" : ""}
            onClick={() => setTab("stock")}
          >
            📦 Stock
          </button>
          <button
            className={tab === "orden" ? "active" : ""}
            onClick={() => setTab("orden")}
          >
            🌱 Órdenes de trabajo
          </button>
          <button
            className={tab === "consulta" ? "active" : ""}
            onClick={() => setTab("consulta")}
          >
            💬 Consulta histórico
          </button>
        </nav>
      </header>

      <main className="app-main">
        {tab === "stock" && <StockScreen />}
        {tab === "orden" && <OrdenScreen />}
        {tab === "consulta" && <ConsultaScreen />}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STOCK — vertical completa: N01 (extracción) + N02 (prevención + hipótesis)
// ---------------------------------------------------------------------------

function StockScreen() {
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advertencia, setAdvertencia] = useState<{
    mensaje: string;
    hipotesis: string;
  } | null>(null);
  const [movimientos, setMovimientos] = usePersistedState<Movimiento[]>(
    "papasud_movimientos",
    [],
  );

  const { listening, start, supported } = useSpeechToText((textoHablado) => {
    setTexto((prev) => (prev ? prev + " " + textoHablado : textoHablado));
  });

  // Calcula stock actual por variedad+lote+ubicación a partir de los movimientos cargados
  function calcularStockActual(movs: Movimiento[]) {
    const stock: Record<string, number> = {};
    for (const m of movs) {
      const ubicacion = m.tipo === "ingreso" ? m.destino : m.origen;
      if (!ubicacion) continue;
      const key = `${ubicacion}·${m.variedad}·${m.lote}`;
      const signo = m.tipo === "ingreso" ? 1 : -1;
      stock[key] = (stock[key] || 0) + signo * m.kg;
    }
    return stock;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setLoading(true);
    setError(null);
    setAdvertencia(null);
    try {
      const data: StockExtraction = await extract(texto, "stock");

      // N02: si es un egreso, verificamos que haya stock suficiente ANTES de aceptarlo
      if (data.tipo === "egreso" && data.origen) {
        const stockActual = calcularStockActual(movimientos);
        const key = `${data.origen}·${data.variedad}·${data.lote}`;
        const disponible = stockActual[key] || 0;

        if (data.kg > disponible) {
          // Le pedimos a la IA una hipótesis sobre la discrepancia
          const textoAnalisis = `Declarado en sistema: ${disponible} kg. Se intenta egresar: ${data.kg} kg. Variedad ${data.variedad}, lote ${data.lote}, ubicación ${data.origen}.`;
          const analisis = await extract(textoAnalisis, "discrepancia");
          setAdvertencia({
            mensaje: `⚠️ Stock insuficiente: hay ${disponible.toLocaleString("es-AR")} kg de ${data.variedad} lote ${data.lote} en ${data.origen}, pero se intenta egresar ${data.kg.toLocaleString("es-AR")} kg.`,
            hipotesis: analisis.hipotesis,
          });
          // No agregamos el movimiento — el sistema "previene" la operación inválida
          setLoading(false);
          return;
        }
      }

      setMovimientos((prev) => [
        ...prev,
        { ...data, id: Date.now(), textoOriginal: texto },
      ]);
      setTexto("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const stockPorUbicacionLegible: Record<string, number> = {};
  for (const m of movimientos) {
    const ubicacion = m.tipo === "ingreso" ? m.destino : m.origen;
    if (!ubicacion) continue;
    const key = `${ubicacion} · ${m.variedad} · Lote ${m.lote}`;
    const signo = m.tipo === "ingreso" ? 1 : -1;
    stockPorUbicacionLegible[key] = (stockPorUbicacionLegible[key] || 0) + signo * m.kg;
  }

  return (
    <div className="screen">
      <p className="screen-desc">
        Registrá un movimiento de stock hablando o escribiendo en lenguaje
        natural. La IA lo convierte en un movimiento estructurado y valida
        que haya stock disponible antes de aceptarlo.
      </p>

      <form onSubmit={handleSubmit} className="input-form">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder='Ej: "Salieron 28380 kilos de king russet lote 910 del galpón para wemar mc cain, remito 674"'
          rows={3}
        />
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Procesando..." : "Procesar movimiento"}
          </button>
          <MicButton
            listening={listening}
            supported={supported}
            onClick={start}
          />
        </div>
      </form>

      {error && <div className="error-box">⚠️ {error}</div>}

      {advertencia && (
        <div className="warning-box">
          <p className="warning-title">{advertencia.mensaje}</p>
          <p className="warning-hypothesis">💡 {advertencia.hipotesis}</p>
        </div>
      )}

      {movimientos.length > 0 && (
        <>
          <h3>Movimientos registrados</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Variedad</th>
                <th>Lote</th>
                <th>Kg</th>
                <th>Ubicación</th>
                <th>Cliente/Remito</th>
                <th>Confianza</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <td>{m.tipo === "ingreso" ? "⬇️ Ingreso" : "⬆️ Egreso"}</td>
                  <td>{m.variedad}</td>
                  <td>{m.lote}</td>
                  <td>{m.kg?.toLocaleString("es-AR")}</td>
                  <td>{m.tipo === "ingreso" ? m.destino : m.origen}</td>
                  <td>{m.cliente || m.remito || "—"}</td>
                  <td>
                    <span className={`badge badge-${m.confianza}`}>
                      {m.confianza}
                    </span>
                    {m.campos_faltantes?.length > 0 && (
                      <span className="hint">
                        {" "}
                        (faltó: {m.campos_faltantes.join(", ")})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Stock actual por ubicación</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ubicación · Variedad · Lote</th>
                <th>Kg actuales</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stockPorUbicacionLegible).map(([key, kg]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td className={kg < 0 ? "negative" : ""}>
                    {kg.toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ÓRDENES DE TRABAJO — N01
// ---------------------------------------------------------------------------

function OrdenScreen() {
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ordenes, setOrdenes] = usePersistedState<any[]>("papasud_ordenes", []);

  const { listening, start, supported } = useSpeechToText((textoHablado) => {
    setTexto((prev) => (prev ? prev + " " + textoHablado : textoHablado));
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await extract(texto, "orden");
      setOrdenes((prev) => [...prev, { ...data, id: Date.now() }]);
      setTexto("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <p className="screen-desc">
        El ingeniero cuenta en sus propias palabras lo que hizo en el campo, y
        el sistema genera la orden de trabajo estructurada.
      </p>

      <form onSubmit={handleSubmit} className="input-form">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder='Ej: "Apliqué fungicida Dithane en el lote 34B del pivote B, dosis 2.5 por hectárea, con drone, el 11 de noviembre"'
          rows={3}
        />
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Procesando..." : "Generar orden"}
          </button>
          <MicButton
            listening={listening}
            supported={supported}
            onClick={start}
          />
        </div>
      </form>

      {error && <div className="error-box">⚠️ {error}</div>}

      {ordenes.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Lote</th>
              <th>Tarea</th>
              <th>Insumo</th>
              <th>Dosis/ha</th>
              <th>Herramienta</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((o) => (
              <tr key={o.id}>
                <td>
                  {o.lote}
                  {o.pivote ? ` (Pivote ${o.pivote})` : ""}
                </td>
                <td>{o.tarea}</td>
                <td>{o.insumo || "—"}</td>
                <td>{o.dosis_por_ha ?? "—"}</td>
                <td>{o.herramienta || "—"}</td>
                <td>{o.fecha || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CONSULTA HISTÓRICO — N01, con el dataset real como contexto
// ---------------------------------------------------------------------------

function ConsultaScreen() {
  const [pregunta, setPregunta] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState<any>(null);

  const { listening, start, supported } = useSpeechToText((textoHablado) => {
    setPregunta((prev) => (prev ? prev + " " + textoHablado : textoHablado));
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pregunta.trim()) return;
    setLoading(true);
    setError(null);
    setRespuesta(null);
    try {
      const data = await extract(pregunta, "consulta", historicalData);
      setRespuesta(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <p className="screen-desc">
        Preguntá en lenguaje natural sobre los datos históricos. La respuesta se
        basa exclusivamente en datos reales.
      </p>

      <form onSubmit={handleSubmit} className="input-form">
        <textarea
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder='Ej: "¿Cuánto Agata lote 241 ingresó en Dospanca?"'
          rows={2}
        />
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Consultando..." : "Preguntar"}
          </button>
          <MicButton
            listening={listening}
            supported={supported}
            onClick={start}
          />
        </div>
      </form>

      {error && <div className="error-box">⚠️ {error}</div>}

      {respuesta && (
        <div className="answer-box">
          <p>{respuesta.respuesta}</p>
          {respuesta.datos_usados?.length > 0 && (
            <details>
              <summary>Ver datos usados ({respuesta.datos_usados.length} registros)</summary>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Remito</th>
                    <th>Fecha</th>
                    <th>Variedad</th>
                    <th>Lote</th>
                    <th>Kg</th>
                    <th>Ubicación</th>
                    <th>Cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {respuesta.datos_usados.map((d: any, i: number) => (
                    <tr key={i}>
                      <td>{d.tipo === "ingreso" ? "⬇️ Ingreso" : "⬆️ Egreso"}</td>
                      <td>{d.remito}</td>
                      <td>{d.fecha}</td>
                      <td>{d.variedad}</td>
                      <td>{d.lote}</td>
                      <td>{d.kg?.toLocaleString("es-AR")}</td>
                      <td>{d.ubicacion}</td>
                      <td>{d.cliente || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
