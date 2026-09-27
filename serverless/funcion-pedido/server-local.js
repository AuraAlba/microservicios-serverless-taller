// Servidor local para probar la funcion en tu computador (opcional).
// No es serverless real, solo sirve para ver como responde.
// Correr con: node server-local.js  ->  http://localhost:3005

const http = require("http");
const { construirRespuesta } = require("./index.js");

const PUERTO = 3005;

const servidor = http.createServer((req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ success: false, message: "Usa el metodo POST." }));
    return;
  }

  let datos = "";
  req.on("data", (parte) => (datos += parte));
  req.on("end", () => {
    let pizza = "desconocida";
    try {
      const json = JSON.parse(datos || "{}");
      if (json.pizza) pizza = json.pizza;
    } catch (e) {
      // si no llega json valido, queda "desconocida"
    }

    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify(construirRespuesta(pizza)));
  });
});

servidor.listen(PUERTO, () => {
  console.log(`[SERVERLESS-LOCAL] Simulacion escuchando en http://localhost:${PUERTO}`);
});
