// API Gateway - puerto 3000
// Es el UNICO punto de entrada del sistema. El cliente le pega solo a este
// servicio (localhost:3000) y el gateway reenvia cada peticion al microservicio
// que corresponde. El cliente no necesita saber que detras hay 4 servicios
// distintos en 4 puertos distintos.

const express = require("express");

const app = express();
app.use(express.json());

const PUERTO = 3000;

// A donde vive cada microservicio.
const URL_PEDIDOS = "http://localhost:3001";
const URL_INVENTARIO = "http://localhost:3002";
const URL_PAGOS = "http://localhost:3003";
const URL_NOTIFICACIONES = "http://localhost:3004";

// -------------------------------------------------------------------
// Middleware de logging
// -------------------------------------------------------------------
app.use((req, res, next) => {
  // Muestra en consola el método HTTP y la ruta original de la petición
  console.log(`[GATEWAY] ${req.method} ${req.originalUrl}`);
  next(); // Continuar con la siguiente función/ruta
});

// -------------------------------------------------------------------
// Funcion ayudante: reenvia (proxea) una peticion a un servicio destino
// y devuelve al cliente exactamente lo que responda ese servicio.
// -------------------------------------------------------------------
async function reenviar(destino, req, res) {
  try {
    const opciones = {
      method: req.method,
      headers: { "Content-Type": "application/json" },
    };
    // Solo mandamos body en metodos que lo llevan.
    if (req.method !== "GET" && req.method !== "HEAD") {
      opciones.body = JSON.stringify(req.body || {});
    }

    const respuesta = await fetch(destino, opciones);
    const datos = await respuesta.json();
    res.status(respuesta.status).json(datos);
  } catch (error) {
    console.log(`[GATEWAY] Error reenviando a ${destino}: ${error.message}`);
    res.status(502).json({
      success: false,
      message: `El gateway no pudo contactar al servicio destino (${destino}).`,
      detalle: error.message,
    });
  }
}

// -------------------------------------------------------------------
// Rutas proxeadas
// -------------------------------------------------------------------

// PEDIDOS (RESUELTO, usalo de modelo)
app.post("/pedidos", (req, res) => {
  reenviar(`${URL_PEDIDOS}/pedidos`, req, res);
});

// NOTIFICACIONES (RESUELTO, usalo de modelo)
app.post("/notificaciones", (req, res) => {
  reenviar(`${URL_NOTIFICACIONES}/notificaciones`, req, res);
});

// INVENTARIO
app.all("/inventario", (req, res) => {
  reenviar(`${URL_INVENTARIO}/inventario`, req, res);
});

app.all("/inventario/:pizza", (req, res) => {
  reenviar(`${URL_INVENTARIO}/inventario/${req.params.pizza}`, req, res);
});

// PAGOS
app.all("/pagos", (req, res) => {
  reenviar(`${URL_PAGOS}/pagos`, req, res);
});

app.get("/", (req, res) => {
  res.json({ servicio: "gateway", estado: "ok", puerto: PUERTO });
});

app.listen(PUERTO, () => {
  console.log(`[GATEWAY] API Gateway escuchando en http://localhost:${PUERTO}`);
});