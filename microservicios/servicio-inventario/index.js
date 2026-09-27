// Servicio de inventario - puerto 3002
// Guarda el stock de cada pizza y descuenta cuando se hace un pedido.

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());

const PUERTO = 3002;

const ARCHIVO_PIZZAS = path.join(__dirname, "pizzas.json");

function leerPizzas() {
  const contenido = fs.readFileSync(ARCHIVO_PIZZAS, "utf-8");
  return JSON.parse(contenido);
}

function guardarPizzas(pizzas) {
  fs.writeFileSync(ARCHIVO_PIZZAS, JSON.stringify(pizzas, null, 2), "utf-8");
}

// Devuelve todo el inventario
app.get("/inventario", (req, res) => {
  const pizzas = leerPizzas();
  res.json(pizzas);
});

// Devuelve una sola pizza
app.get("/inventario/:pizza", (req, res) => {
  const pizzas = leerPizzas();
  const nombre = req.params.pizza.toLowerCase();
  const pizza = pizzas[nombre];

  if (!pizza) {
    return res.status(404).json({
      disponible: false,
      message: "Esa pizza no existe en el menu.",
    });
  }

  res.json({
    pizza: nombre,
    stock: pizza.stock,
    disponible: pizza.stock > 0,
    precio: pizza.precio,
    ingredientes: pizza.ingredientes,
  });
});

// Descuenta una pizza del stock si hay disponible
app.post("/inventario", (req, res) => {
  const { pizza } = req.body;

  if (!pizza) {
    return res.status(400).json({
      disponible: false,
      message: "Debes enviar el campo 'pizza'.",
    });
  }

  const nombre = pizza.toLowerCase();
  const pizzas = leerPizzas();
  const encontrada = pizzas[nombre];

  if (!encontrada) {
    return res.status(404).json({
      disponible: false,
      message: `La pizza '${pizza}' no existe en el menu.`,
    });
  }

  if (encontrada.stock <= 0) {
    // No hay stock
    return res.status(409).json({
      disponible: false,
      message: `No hay stock disponible de pizza ${encontrada.nombre}.`,
      stock: encontrada.stock,
    });
  }

  encontrada.stock = encontrada.stock - 1;
  guardarPizzas(pizzas);

  res.json({
    disponible: true,
    message: `Se reservo una pizza ${encontrada.nombre}.`,
    stockRestante: encontrada.stock,
    precio: encontrada.precio,
  });
});

app.get("/", (req, res) => {
  res.json({ servicio: "inventario", estado: "ok", puerto: PUERTO });
});

app.listen(PUERTO, () => {
  console.log(`[INVENTARIO] Servicio de inventario escuchando en http://localhost:${PUERTO}`);
});
