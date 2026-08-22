// Dataset histórico real (extraído de la planilla de movimientos de Papasud)
// Usado como contexto verificable para la vertical "Consulta histórico".
// La IA solo puede responder con lo que está acá — no inventa números.

export const historicalData = [
  // --- Ingresos (campo -> ubicación) ---
  { tipo: "ingreso", remito: 1001, fecha: "2026-03-09", variedad: "Agata", lote: "241", kg: 35160, bolsas: 705, ubicacion: "Dospanca" },
  { tipo: "ingreso", remito: 1002, fecha: "2026-03-10", variedad: "Agata", lote: "241", kg: 34500, bolsas: 700, ubicacion: "Dospanca" },
  { tipo: "ingreso", remito: 1005, fecha: "2026-03-13", variedad: "King Russet", lote: "910", kg: 3008, bolsas: 64, ubicacion: "Galpón" },
  { tipo: "ingreso", remito: 1006, fecha: "2026-03-27", variedad: "Spunta", lote: "300", kg: 35980, bolsas: 700, ubicacion: "Dospanca" },
  { tipo: "ingreso", remito: 1007, fecha: "2026-03-28", variedad: "Spunta", lote: "300", kg: 35920, bolsas: 700, ubicacion: "Dospanca" },
  { tipo: "ingreso", remito: 1008, fecha: "2026-03-30", variedad: "Agata", lote: "225", kg: 27132, bolsas: 532, ubicacion: "Dospanca" },
  { tipo: "ingreso", remito: 1009, fecha: "2026-03-29", variedad: "Spunta", lote: "300", kg: 10200, bolsas: 204, ubicacion: "Galpón" },
  { tipo: "ingreso", remito: 1009, fecha: "2026-03-29", variedad: "Asterix", lote: "811", kg: 25000, bolsas: 500, ubicacion: "Galpón" },
  { tipo: "ingreso", remito: 1010, fecha: "2026-03-30", variedad: "Memphis", lote: "511", kg: 10703, bolsas: 225, ubicacion: "Dospanca" },
  { tipo: "ingreso", remito: 1011, fecha: "2026-03-31", variedad: "Agata", lote: "230", kg: 36540, bolsas: 700, ubicacion: "Dospanca" },
  { tipo: "ingreso", remito: 1108, fecha: "2026-04-14", variedad: "Ludmilla", lote: "602", kg: 32300, bolsas: 630, ubicacion: "Frigopap" },
  { tipo: "ingreso", remito: 1109, fecha: "2026-04-15", variedad: "Daifla", lote: "351", kg: 27480, bolsas: 561, ubicacion: "Frigopap" },

  // --- Egresos (ubicación -> cliente) ---
  { tipo: "egreso", remito: 674, fecha: "2026-03-12", variedad: "King Russet", lote: "910", kg: 28380, bolsas: 579, ubicacion: "Galpón", cliente: "Wemar - Mc Cain" },
  { tipo: "egreso", remito: 675, fecha: "2026-03-12", variedad: "King Russet", lote: "910", kg: 32040, bolsas: 654, ubicacion: "Galpón", cliente: "Wemar - Mc Cain" },
  { tipo: "egreso", remito: 850, fecha: "2026-04-21", variedad: "Asterix", lote: "811", kg: 15600, bolsas: 311, ubicacion: "Galpón", cliente: "Parmentier" },
  { tipo: "egreso", remito: 1020, fecha: "2026-04-16", variedad: "Daifla", lote: "351", kg: 27480, bolsas: 561, ubicacion: "Frigopap", cliente: "Parmentier" },
  { tipo: "egreso", remito: 871, fecha: "2026-04-29", variedad: "Ludmilla", lote: "602", kg: 32500, bolsas: 630, ubicacion: "Frigopap", cliente: "Frigopap Cliente Directo" },
  { tipo: "egreso", remito: 721, fecha: "2026-05-06", variedad: "Spunta", lote: "300", kg: 34260, bolsas: 685, ubicacion: "Dospanca", cliente: "La Unión del Sur" },
  { tipo: "egreso", remito: 722, fecha: "2026-05-06", variedad: "Spunta", lote: "300", kg: 33780, bolsas: 676, ubicacion: "Dospanca", cliente: "La Unión del Sur" },
  { tipo: "egreso", remito: 1011, fecha: "2026-04-02", variedad: "Agata", lote: "241", kg: 29080, bolsas: 600, ubicacion: "Dospanca", cliente: "Cerone (Raphael)" },
];

// Info del escenario de discrepancia, útil para el paso 3 (N02)
export const discrepanciaDemo = {
  variedad: "King Russet",
  lote: "910",
  ubicacion: "Galpón",
  kg_faltante_en_sistema: 33780,
  bolsas_faltante_en_sistema: 689,
};
