// Servicio de pedidos - puerto 3001
// Recibe el pedido y llama a inventario y pagos.
// Cliente -> Pedidos -> Inventario -> Pagos -> Pedido confirmado

const express = require("express");

const app = express();
app.use(express.json());

const PUERTO = 3001;

const URL_INVENTARIO = "http://localhost:3002";
const URL_PAGOS = "http://localhost:3003";

// Notificaciones (opcional, Seccion 14)
const URL_NOTIFICACIONES = "http://localhost:3004";

// Seccion 14: poner en true solo cuando notificaciones este corriendo
const NOTIFICACIONES_ACTIVAS = false;

// Tiempo maximo de espera a otro servicio, en ms (Actividad 5: cambiar este valor)
const TIMEOUT_MS = 5000;

let contadorPedidos = 0;

// Hace una peticion y se rinde si tarda mas que TIMEOUT_MS
async function peticionConTimeout(url, opciones) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);
  try {
    const respuesta = await fetch(url, { ...opciones, signal: controlador.signal });
    return respuesta;
  } finally {
    clearTimeout(temporizador);
  }
}

app.post("/pedidos", async (req, res) => {
  const { pizza } = req.body;

  if (!pizza) {
    return res.status(400).json({
      success: false,
      message: "Debes enviar el campo 'pizza'. Ejemplo: { \"pizza\": \"hawaiana\" }",
    });
  }

  contadorPedidos = contadorPedidos + 1;
  const pedidoId = contadorPedidos;

  console.log(`\n[PEDIDOS] Nuevo pedido #${pedidoId}: ${pizza}`);

  // Paso 1: consultar inventario
  let datosInventario;
  try {
    const respInv = await peticionConTimeout(`${URL_INVENTARIO}/inventario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pizza }),
    });
    datosInventario = await respInv.json();

    if (!datosInventario.disponible) {
      console.log(`[PEDIDOS] Pedido #${pedidoId} rechazado por inventario.`);
      return res.status(409).json({
        success: false,
        pedidoId,
        pizza,
        message: `Pedido rechazado: ${datosInventario.message}`,
      });
    }
  } catch (error) {
    // Error al hablar con inventario
    console.log(`[PEDIDOS] Error hablando con INVENTARIO: ${error.message}`);
    return res.status(503).json({
      success: false,
      pedidoId,
      pizza,
      message:
        "No se pudo contactar al Servicio de Inventario. Revisa que este ejecutandose en el puerto 3002.",
      detalle: error.message,
    });
  }

  // Paso 2: cobrar
  let datosPago;
  try {
    const respPago = await peticionConTimeout(`${URL_PAGOS}/pagos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pizza, monto: datosInventario.precio }),
    });
    datosPago = await respPago.json();

    if (!datosPago.aprobado) {
      console.log(`[PEDIDOS] Pedido #${pedidoId} rechazado por pagos.`);
      return res.status(402).json({
        success: false,
        pedidoId,
        pizza,
        message: `Pedido rechazado: ${datosPago.message}`,
      });
    }
  } catch (error) {
    // Error al hablar con pagos
    console.log(`[PEDIDOS] Error hablando con PAGOS: ${error.message}`);
    return res.status(503).json({
      success: false,
      pedidoId,
      pizza,
      message:
        "No se pudo contactar al Servicio de Pagos. Revisa que este ejecutandose en el puerto 3003.",
      detalle: error.message,
    });
  }

  // Paso 3 (opcional): avisar a notificaciones. Si falla, el pedido igual sigue.
  let notificacion = null;
  if (NOTIFICACIONES_ACTIVAS) {
    try {
      const respNot = await peticionConTimeout(`${URL_NOTIFICACIONES}/notificaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId, pizza }),
      });
      notificacion = await respNot.json();
    } catch (error) {
      console.log(`[PEDIDOS] No se pudo notificar (no pasa nada): ${error.message}`);
      notificacion = { success: false, message: "No se pudo enviar la notificacion." };
    }
  }

  // Pedido confirmado
  console.log(`[PEDIDOS] Pedido #${pedidoId} CONFIRMADO.`);
  res.json({
    success: true,
    pedidoId,
    pizza,
    precio: datosInventario.precio,
    stockRestante: datosInventario.stockRestante,
    transaccion: datosPago.transaccion,
    notificacion,
    message: `Pedido #${pedidoId} de pizza ${pizza} confirmado con exito.`,
  });
});

app.get("/", (req, res) => {
  res.json({ servicio: "pedidos", estado: "ok", puerto: PUERTO });
});

app.listen(PUERTO, () => {
  console.log(`[PEDIDOS] Servicio de pedidos escuchando en http://localhost:${PUERTO}`);
  console.log(`[PEDIDOS] Timeout configurado en ${TIMEOUT_MS} ms.`);
});
