// Servicio de pagos - puerto 3003
// Simula el cobro. Para el taller siempre aprueba el pago.

const express = require("express");

const app = express();
app.use(express.json());

const PUERTO = 3003;

app.post("/pagos", (req, res) => {
  const { pizza, monto } = req.body;

  if (monto === undefined || monto === null) {
    return res.status(400).json({
      aprobado: false,
      message: "Debes enviar el campo 'monto'.",
    });
  }

  // Numero de transaccion inventado
  const transaccion = "TX-" + Math.floor(Math.random() * 1000000);

  res.json({
    aprobado: true,
    transaccion: transaccion,
    monto: monto,
    message: `Pago aprobado por $${monto}${pizza ? " (pizza " + pizza + ")" : ""}.`,
  });
});

app.get("/", (req, res) => {
  res.json({ servicio: "pagos", estado: "ok", puerto: PUERTO });
});

app.listen(PUERTO, () => {
  console.log(`[PAGOS] Servicio de pagos escuchando en http://localhost:${PUERTO}`);
});
