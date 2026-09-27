// Funcion serverless de ejemplo.
// Recibe una pizza y devuelve un resumen del pedido.

function construirRespuesta(pizza) {
  const nombre = (pizza || "desconocida").toString();

  const ahora = new Date();
  const entrega = new Date(ahora.getTime() + 30 * 60 * 1000); // +30 min

  return {
    success: true,
    pizza: nombre,
    message: `Pedido de pizza ${nombre} recibido por la funcion Serverless.`,
    entregaEstimada: entrega.toISOString(),
    ejecutadaEn: ahora.toISOString(),
  };
}

// Handler para Vercel / Netlify
module.exports = (req, res) => {
  let pizza = "desconocida";

  if (req.body && req.body.pizza) {
    pizza = req.body.pizza;
  }

  const cuerpo = construirRespuesta(pizza);

  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify(cuerpo));
};

module.exports.construirRespuesta = construirRespuesta;
