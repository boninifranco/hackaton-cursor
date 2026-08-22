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
          const analisis = await extract(textoAnalisis, "discrepancia" as any);
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

  const stockPorUbicacion = calcularStockActual(movimientos);
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
