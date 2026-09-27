// Servicio de notificaciones - puerto 3004
// Lo completas tu. Faltan los pasos marcados como COMPLETAR.

const express = require("express");

const app = express();
app.use(express.json());

const PUERTO = 3004;

app.post("/notificaciones", (req, res) => {
  // COMPLETAR (Paso 1): leer pedidoId y pizza del body.
  // const { pedidoId, pizza } = req.body;

  // COMPLETAR (Paso 2): mostrar el aviso en consola.
  // console.log(`[NOTIFICACIONES] Aviso: tu pedido ${pedidoId} de pizza ${pizza} esta confirmado.`);

  // COMPLETAR (Paso 3): responder con exito y borrar la respuesta temporal de abajo.
  // return res.json({
  //   success: true,
  //   message: `Notificacion enviada para el pedido ${pedidoId}`,
  // });

  // Respuesta temporal (borrala al terminar)
  res.status(501).json({
    success: false,
    message:
      "Este servicio todavia no esta completo. Sigue los pasos 'COMPLETAR' en index.js.",
  });
});

app.get("/", (req, res) => {
  res.json({ servicio: "notificaciones", estado: "ok", puerto: PUERTO });
});

app.listen(PUERTO, () => {
  console.log(`[NOTIFICACIONES] Servicio de notificaciones escuchando en http://localhost:${PUERTO}`);
});
