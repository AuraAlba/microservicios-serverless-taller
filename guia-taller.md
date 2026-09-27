# Taller de Microservicios y Serverless — La Pizzería

Trabaja siguiendo las actividades en orden y responde las preguntas en `respuestas/respuestas.md`.

## Objetivos

- Ejecutar y probar un sistema de microservicios.
- Observar la comunicación entre servicios por HTTP.
- Ver el comportamiento ante fallos (sin stock, servicio caído, timeout).
- Completar y probar un microservicio nuevo.
- Consumir una función Serverless y compararla con los microservicios.

## Contexto

### Microservicios

El sistema está dividido en servicios independientes, cada uno con una
responsabilidad distinta, que se comunican por HTTP.

```text
Cliente
   ↓
Pedidos       (3001)
   ↓
Inventario    (3002)
   ↓
Pagos         (3003)
   ↓
Pedido confirmado
```

- **Pedidos (3001):** recibe el pedido y coordina inventario y pagos.
- **Inventario (3002):** controla el stock de cada pizza.
- **Pagos (3003):** simula el cobro (siempre aprueba).

### Estructura del proyecto

```text
taller-microservicios-serverless/
├── microservicios/
│   ├── servicio-pedidos/         (3001)
│   ├── servicio-inventario/      (3002, incluye pizzas.json)
│   ├── servicio-pagos/           (3003)
│   ├── servicio-notificaciones/  (3004, lo completas tú)
│   └── gateway/                  (3000, punto de entrada único que completas tú)
├── serverless/
│   └── funcion-pedido/
├── respuestas/
│   └── respuestas.md
├── guia-taller.md
└── README.md
```

El gateway (`microservicios/gateway/`) se trabaja en la sección **API Gateway**.

### Menú (pizzas.json)

| Pizza | Precio | Stock inicial |
|---|---|---|
| margarita | 18000 | 5 |
| hawaiana | 22000 | 5 |
| pepperoni | 24000 | 5 |
| vegetariana | 21000 | 5 |
| pollo | 23000 | 5 |

### Endpoints

| Servicio | Método | Ruta | Función |
|---|---|---|---|
| Pedidos | POST | `/pedidos` | Crear un pedido |
| Inventario | GET | `/inventario` | Ver todo el inventario |
| Inventario | GET | `/inventario/:pizza` | Ver una pizza |
| Inventario | POST | `/inventario` | Reservar/descontar una pizza |
| Pagos | POST | `/pagos` | Procesar un pago |
| Notificaciones | POST | `/notificaciones` | Enviar notificación (Sección: cuarto microservicio) |
| Gateway | (varias) | `/pedidos`, `/inventario`, `/pagos`, `/notificaciones` | Punto de entrada único que reenvía a cada servicio (Sección: API Gateway) |

### Puertos del sistema

| Componente | Puerto | Aparece en |
|---|---|---|
| servicio-pedidos | 3001 | Base |
| servicio-inventario | 3002 | Base |
| servicio-pagos | 3003 | Base |
| servicio-notificaciones | 3004 | Cuarto microservicio |
| gateway | 3000 | API Gateway |

Requisito: Node.js 18 o superior.

---

## 1. Preparar el proyecto

Instala las dependencias de cada servicio:

```text
cd microservicios/servicio-pedidos
npm install

cd ../servicio-inventario
npm install

cd ../servicio-pagos
npm install
```

---

## 2. Ejecutar los servicios

Abre tres terminales y ejecuta un servicio en cada una:

### Pedidos
```text
cd microservicios/servicio-pedidos
node index.js
```

### Inventario
```text
cd microservicios/servicio-inventario
node index.js
```

### Pagos
```text
cd microservicios/servicio-pagos
node index.js
```

**Resultado esperado:** los tres servicios quedan ejecutándose en los puertos
3001, 3002 y 3003, cada uno mostrando su mensaje de arranque.

Para detener un servicio: `Ctrl + C` en su terminal.

---

## 3. Realizar un pedido

Envía un POST a `http://localhost:3001/pedidos` con el cuerpo
`{ "pizza": "hawaiana" }`.

**curl (PowerShell):**
```text
curl.exe -X POST http://localhost:3001/pedidos -H "Content-Type: application/json" -d '{\"pizza\":\"hawaiana\"}'
```

**curl (Mac/Linux):**
```text
curl -X POST http://localhost:3001/pedidos -H "Content-Type: application/json" -d '{"pizza":"hawaiana"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "pedidoId": 1,
  "pizza": "hawaiana",
  "precio": 22000,
  "stockRestante": 4,
  "transaccion": "TX-889264",
  "notificacion": null,
  "message": "Pedido #1 de pizza hawaiana confirmado con exito."
}
```

---

## Actividades — Microservicios

Registra tus observaciones y responde en `respuestas/respuestas.md`.

### Actividad 1 — Ejecutar los servicios

1. Ejecuta `servicio-pedidos` en el puerto 3001.
2. Ejecuta `servicio-inventario` en el puerto 3002.
3. Ejecuta `servicio-pagos` en el puerto 3003.
4. Verifica que los tres estén disponibles.
5. Evidencia: captura de las tres terminales con los servicios corriendo.
6. Responde la pregunta 1.

### Actividad 2 — Realizar pedidos

1. Realiza tres pedidos con pizzas distintas (por ejemplo `margarita`,
   `pepperoni`, `pollo`).
2. Verifica en cada respuesta: `pedidoId`, `precio`, `stockRestante`,
   `transaccion`.
3. Evidencia: captura de un pedido exitoso.
4. Responde la pregunta 2.

### Actividad 3 — Modificar inventario

1. En `microservicios/servicio-inventario/pizzas.json`, cambia el `stock` de una
   pizza (por ejemplo `vegetariana`) a `0` y guarda.
2. Realiza un pedido de esa pizza.
3. **Resultado esperado:** el pedido se rechaza (HTTP 409) con un mensaje de
   inventario sin stock.
4. Evidencia: captura del pedido rechazado.
5. Responde la pregunta 3 (y ten en cuenta esta observación para la 5).
6. Al terminar, vuelve a dejar el `stock` en `5` si vas a seguir probando.

### Actividad 4 — Detener un servicio

1. Detén `servicio-inventario` (`Ctrl + C`).
2. Realiza un pedido de cualquier pizza.
3. **Resultado esperado:** `servicio-pedidos` responde con error controlado
   (HTTP 503) sin caerse.
4. Evidencia: captura del error.
5. Responde la pregunta 3.
6. Vuelve a ejecutar `servicio-inventario` antes de continuar.

### Actividad 5 — Timeout

1. En `microservicios/servicio-pedidos/index.js`, localiza:
   ```js
   const TIMEOUT_MS = 5000;
   ```
2. Cámbialo a un valor menor, por ejemplo `1`.
3. Guarda y reinicia `servicio-pedidos`.
4. Realiza un pedido.
5. **Resultado esperado:** el pedido probablemente falla (HTTP 503) por
   superarse el timeout antes de recibir respuesta.
6. Responde la pregunta 5.
7. Restaura `const TIMEOUT_MS = 5000;`, guarda y reinicia `servicio-pedidos`.

---

## Cuarto microservicio — servicio-notificaciones

Responsabilidad del servicio: avisar cuando un pedido se confirma. Escucha en el
puerto 3004 y expone `POST /notificaciones`.

### Pasos

1. Entra a `microservicios/servicio-notificaciones` e instala dependencias:
   ```text
   npm install
   ```
2. Abre `index.js`. El servidor y la ruta ya están, faltan los bloques marcados
   como `COMPLETAR` dentro de `POST /notificaciones`.
3. Completa las tres partes marcadas dentro de `POST /notificaciones`:
   - Paso 1: leer `pedidoId` y `pizza` del cuerpo de la petición.
   - Paso 2: mostrar un aviso en consola con esos datos.
   - Paso 3: responder con un JSON de éxito con la forma indicada en la respuesta
     esperada (más abajo) y borrar la respuesta temporal.
4. Ejecuta el servicio en el puerto 3004:
   ```text
   node index.js
   ```
5. Prueba `POST /notificaciones` con `{ "pedidoId": 123, "pizza": "hawaiana" }`:

   **PowerShell:**
   ```text
   curl.exe -X POST http://localhost:3004/notificaciones -H "Content-Type: application/json" -d '{\"pedidoId\":123,\"pizza\":\"hawaiana\"}'
   ```
   **Mac/Linux:**
   ```text
   curl -X POST http://localhost:3004/notificaciones -H "Content-Type: application/json" -d '{"pedidoId":123,"pizza":"hawaiana"}'
   ```
6. **Respuesta esperada:**
   ```json
   { "success": true, "message": "Notificación enviada para el pedido 123" }
   ```
7. Evidencia: captura del cuarto microservicio respondiendo.
8. Responde la pregunta 6.

### Integración al flujo

Conecta notificaciones al flujo:
`Cliente → Pedidos → Inventario → Pagos → Notificaciones → Pedido confirmado`.

1. Con `servicio-notificaciones` corriendo en el 3004.
2. En `microservicios/servicio-pedidos/index.js` cambia:
   ```js
   const NOTIFICACIONES_ACTIVAS = false;
   ```
   por:
   ```js
   const NOTIFICACIONES_ACTIVAS = true;
   ```
3. Guarda y reinicia `servicio-pedidos`.
4. Realiza un pedido. La respuesta ahora incluye el bloque `notificacion`.
5. Prueba adicional: detén `servicio-notificaciones` y realiza otro pedido. El
   pedido se confirma igual; solo el campo `notificacion` indica que no se pudo
   enviar el aviso.

---

## Preguntas de análisis — Microservicios

Responde en `respuestas/respuestas.md` con la misma numeración, según lo que
hiciste y observaste.

1. ¿Qué responsabilidad tiene cada microservicio?
2. ¿Cómo se comunican?
3. ¿Qué ocurre cuando un servicio deja de funcionar?
4. ¿Qué ventajas observaste al separar el sistema?
5. ¿Qué problemas puede generar tener varios servicios?
6. ¿Qué aprendiste al crear servicio-notificaciones?

---

## Serverless

Objetivo: consumir una función que se ejecuta bajo demanda, sin mantener un
servidor propio, y compararla con los microservicios anteriores.

La función `funcion-pedido` recibe una pizza y devuelve un resumen del pedido con
hora estimada de entrega.

### Camino A — ejecutar la función localmente

1. Arranca la simulación local:
   ```text
   cd serverless/funcion-pedido
   node server-local.js
   ```
   Queda en `http://localhost:3005`.
2. Realiza una petición:
   ```text
   curl.exe -X POST http://localhost:3005/ -H "Content-Type: application/json" -d '{\"pizza\":\"hawaiana\"}'
   ```
   (Mac/Linux: `curl -X POST http://localhost:3005/ -H "Content-Type: application/json" -d '{"pizza":"hawaiana"}'`)
3. **Respuesta esperada:**
   ```json
   {
     "success": true,
     "pizza": "hawaiana",
     "message": "Pedido de pizza hawaiana recibido por la funcion Serverless.",
     "entregaEstimada": "...",
     "ejecutadaEn": "..."
   }
   ```

### Camino B — desplegar en Vercel (opcional)

`index.js` es compatible con Vercel/Netlify y hay un `vercel.json` listo.

```text
npm install -g vercel
cd serverless/funcion-pedido
vercel
```

Al terminar obtienes una URL pública. Llámala igual que en el Camino A cambiando
la dirección. Si usas este camino, anota tu URL en `respuestas/respuestas.md`.

### Actividad — Serverless

1. Ejecuta/prueba la función (Camino A o B).
2. Realiza una petición.
3. Cambia la pizza (por ejemplo a `pollo`).
4. Repite la petición.
5. Compara los resultados.
6. Mide los tiempos de varias llamadas. En PowerShell:
   ```text
   Measure-Command { curl.exe -X POST http://localhost:3005/ -H "Content-Type: application/json" -d '{\"pizza\":\"pollo\"}' }
   ```
   Observa si los tiempos varían entre llamadas y regístralo. Las primeras
   llamadas pueden tardar más que las siguientes.
7. Evidencia: captura de la función respondiendo.
8. Responde las preguntas 7 a 10.

---

## Preguntas de análisis — Serverless

7. ¿Qué es Serverless?
8. ¿Qué diferencia observaste frente a los servicios locales?
9. ¿Qué significa ejecutar una función bajo demanda?
10. ¿Qué ventajas y limitaciones observaste?

---

## API Gateway

Contexto: hoy el cliente le pega directo a cada puerto (3001, 3002, 3003, 3004).
Un **API Gateway** es un único punto de entrada: el cliente solo conoce
`localhost:3000` y el gateway reenvía cada petición al servicio que corresponde.
El cliente deja de saber cuántos servicios hay detrás.

El gateway vive en `microservicios/gateway/` y escucha en el puerto 3000.

### Lo que ya viene resuelto

- El esqueleto del gateway (`index.js`), con la función `reenviar(...)` que proxea
  peticiones, y las rutas de **pedidos** y **notificaciones** ya conectadas como
  ejemplo.

### Lo que completas tú (bloques `COMPLETAR` en `gateway/index.js`)

Abre `gateway/index.js`. Las rutas de **pedidos** y **notificaciones** ya están
resueltas: úsalas como modelo. Completa las partes marcadas con `COMPLETAR` (cada
una lanza un error hasta que la resuelvas, para que se note lo que falta):

1. **Las rutas de inventario y pagos.** Dentro de cada ruta, reenvía la petición
   al servicio que corresponde usando la función `reenviar(...)`. El destino es la
   URL del servicio (`URL_INVENTARIO` o `URL_PAGOS`) más la ruta pedida. Recuerda
   que inventario tiene la ruta `/inventario/:pizza`, donde `:pizza` viene en la
   URL. Fíjate en cómo lo hacen las rutas de pedidos y notificaciones.
2. **Un middleware de logging** que imprima en consola el método y la ruta de cada
   petición (por ejemplo: `[GATEWAY] POST /pedidos`). Pista de sintaxis: un
   middleware de Express recibe `(req, res, next)` y al terminar debe llamar a
   `next()` para dejar pasar la petición.

### Actividad 6 — Probar todo a través del gateway

1. Instala dependencias del gateway y ejecútalo:
   ```text
   cd microservicios/gateway
   npm install
   node index.js
   ```
2. Con los demás servicios corriendo, repite las pruebas del taller pero pegándole
   siempre al **puerto 3000**, no a cada servicio por separado:
   ```text
   curl.exe -X POST http://localhost:3000/pedidos -H "Content-Type: application/json" -d '{\"pizza\":\"hawaiana\"}'
   curl.exe http://localhost:3000/inventario
   ```
3. **Resultado esperado:** las respuestas son idénticas a cuando pegabas directo a
   cada puerto, y en la terminal del gateway aparece tu log (`[GATEWAY] POST /pedidos`).
4. Evidencia: captura de una petición pasando por el gateway y del log en consola.
5. Responde la pregunta 15.

---

## Comparación Microservicios vs Serverless

Completa esta tabla en `respuestas/respuestas.md` con lo que observaste:

| Característica | Microservicios | Serverless |
|---|---|---|
| Unidad principal | | |
| Ejemplo del taller | | |
| ¿Quién ejecuta el servicio? | | |
| ¿Cuándo se ejecuta? | | |
| Comunicación | | |
| Infraestructura | | |
| ¿Qué pudo observar el estudiante? | | |

### Preguntas finales

11. ¿Qué diferencia principal encontraste entre Microservicios y Serverless?
12. ¿En qué situación utilizarías una arquitectura de Microservicios?
13. ¿En qué situación utilizarías una función Serverless?
14. ¿Qué fue lo más importante que aprendiste durante el taller?

---

## Preguntas de análisis — API Gateway

15. ¿Qué ventaja tiene que el cliente no sepa que hay varios servicios distintos
    detrás del gateway?

---

## Evidencias

Incluye en el repositorio las capturas solicitadas:

1. Los tres servicios corriendo (Actividad 1).
2. Un pedido exitoso (Actividad 2).
3. Un pedido rechazado por falta de inventario (Actividad 3).
4. El error al detener un servicio (Actividad 4).
5. El cuarto microservicio respondiendo (servicio-notificaciones).
6. La función Serverless respondiendo.
7. Una petición pasando por el gateway y su log en consola (Sección: API Gateway).

---

## Entrega

### Entrega final

Entrega el enlace del repositorio de GitHub. El repositorio debe contener:

```text
microservicios/
├── servicio-pedidos/
├── servicio-inventario/
├── servicio-pagos/
├── servicio-notificaciones/
└── gateway/                

serverless/
└── funcion-pedido/

respuestas/
└── respuestas.md

README.md
```

`respuestas.md` debe contener las respuestas a todas las preguntas de análisis y
la tabla comparativa. Las evidencias solicitadas deben estar incluidas en el
repositorio. No subas `node_modules/`.

