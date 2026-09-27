# funcion-pedido (Serverless)

Función Serverless de ejemplo para el taller. Recibe el nombre de una pizza y
devuelve un resumen del pedido con una hora estimada de entrega.

## Probarla en tu computador (no requiere nube)

```
npm start
```

Esto arranca `server-local.js` en `http://localhost:3005`. Es solo una ayuda
para ver el comportamiento de la función; **no** es Serverless real.

Llamada de prueba:

```
curl -X POST http://localhost:3005/ -H "Content-Type: application/json" -d '{"pizza":"hawaiana"}'
```

## Desplegarla de verdad (opcional)

El archivo `index.js` está escrito como una función compatible con Vercel /
Netlify, y hay un `vercel.json` listo. Para desplegar con Vercel:

```
npm install -g vercel
vercel
```

Al terminar obtendrás una URL pública. Consulta la sección Serverless de
`guia-taller.md` para el paso a paso.

## Archivos

- `index.js` — la función (handler `(req, res)`) y su lógica.
- `server-local.js` — servidor local para probarla sin nube.
- `vercel.json` — configuración para desplegar en Vercel.
- `package.json` — metadatos del proyecto.
