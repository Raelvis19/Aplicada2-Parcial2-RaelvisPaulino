# Vice City Motors

Aplicación móvil de Expo SDK 58 y Expo Router.

## Ejecutar

Dentro de `AP2`, ejecuta estos comandos.

```powershell
npm install
npm start
```

Abre la app en Expo Go escaneando el código QR, o pulsa `a` en la terminal para abrirla en tu emulador Android. En la primera pantalla, elige **Crear una cuenta** y regístrate con tus propios datos.

```powershell
npm run lint
npm run typecheck
```

## API

`services/peticionesApi.js` concentra todas las peticiones. Expo Router usa `src/app` para las pantallas y la sesión se guarda en AsyncStorage.

| Operación | Método y ruta configurados |
| --- | --- |
| Registro | `POST /auth/registro` |
| Inicio de sesión | `POST /auth/login` |
| Catálogo | `GET /vehiculos` |
| Detalle | `GET /vehiculos/:id` |
| Compra por transferencia | `POST /ventas` |
| Historial del usuario | `GET /ventas` con el JWT del cliente |

Las rutas, el uso de JWT y los campos de la solicitud de compra se contrastaron con `ViceCityMotors.postman_collection.json`. La API limita `GET /ventas` a las compras del usuario cuando el JWT corresponde a un cliente. La colección también documenta `GET /vehiculos?estado=disponible`. La app aplica ese mismo filtro sobre el catálogo cargado.

Queda pendiente validar las respuestas con la API en vivo.
