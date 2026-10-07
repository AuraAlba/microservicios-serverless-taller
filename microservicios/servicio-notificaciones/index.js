// Servicio de notificaciones - puerto 3004
// Lo completas tu. Faltan los pasos marcados como COMPLETAR.

const express = require("express");

const app = express();
app.use(express.json());

const PUERTO = 3004;

app.post("/notificaciones", (req, res) => {
  // Paso 1: Obtener pedidoId y pizza desde el cuerpo de la petición (req.body)
  const { pedidoId, pizza } = req.body;

  // Validar que los datos necesarios están presentes
  if (!pedidoId || !pizza) {
    return res.status(400).json({
      success: false,
      message: "Faltan datos obligatorios: 'pedidoId' o 'pizza'",
    });
  }

  // Paso 2: Mostrar el mensaje de confirmación en la consola
  console.log(`[NOTIFICACIONES] Aviso: tu pedido ${pedidoId} de pizza ${pizza} esta confirmado.`);

  // Paso 3: Responder con éxito
  return res.json({
    success: true,
    message: `Notificacion enviada para el pedido ${pedidoId}`,
  });
});

app.get("/", (req, res) => {
  res.json({ servicio: "notificaciones", estado: "ok", puerto: PUERTO });
});

app.listen(PUERTO, () => {
  console.log(`[NOTIFICACIONES] Servicio de notificaciones escuchando en http://localhost:${PUERTO}`);
});
