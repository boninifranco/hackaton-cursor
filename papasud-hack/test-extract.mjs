// test-extract.mjs
// Corré esto con: node test-extract.mjs
// (dejá netlify dev corriendo en otra terminal)

const res = await fetch("http://localhost:8888/.netlify/functions/extract", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    texto: "Ingresaron 35000kg de king russet al galón, lote 1585",
    tipo: "stock"
  })
});

console.log("Status:", res.status);
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
