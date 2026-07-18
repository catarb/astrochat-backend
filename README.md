# AstroChat Backend

## Descripción

AstroChat Backend es la API REST del proyecto integrador Full-Stack AstroChat. Permite registrar usuarios, verificar sus correos electrónicos, iniciar sesión, explorar y administrar Astros, crear conversaciones, persistir mensajes y obtener respuestas educativas sobre astronomía mediante Google Gemini.

La aplicación utiliza MongoDB para la persistencia y una arquitectura en capas que separa rutas, controladores, lógica de negocio, acceso a datos y modelos.

## Tecnologías

- Node.js y npm.
- Express.
- MongoDB y Mongoose.
- JSON Web Tokens mediante `jsonwebtoken`.
- `bcrypt` para el hash de contraseñas.
- `express-validator` para validar parámetros, consultas y cuerpos.
- Nodemailer para correo SMTP.
- Google Gemini mediante `@google/genai`.
- `cors`.
- `dotenv`.
- Nodemon para desarrollo.

## Requisitos previos

- Node.js.
- npm.
- MongoDB Atlas o una instancia compatible de MongoDB.
- Una cuenta o proveedor SMTP para enviar verificaciones de correo.
- Una API key de Google Gemini.

## Instalación local

```bash
git clone https://github.com/catarb/astrochat-backend.git
cd astrochat-backend
npm install
```

Creá el archivo de configuración local a partir del ejemplo:

```bash
cp .env.example .env
```

En PowerShell también se puede utilizar:

```powershell
Copy-Item .env.example .env
```

Completá las variables requeridas sin publicar credenciales y levantá el servidor:

```bash
npm run dev
```

Con la configuración de ejemplo, la API queda disponible en `http://localhost:3000/api`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto HTTP. Si no está definida, se utiliza `3000`. |
| `MONGODB_URI` | URI de conexión a MongoDB Atlas o MongoDB compatible. Es obligatoria. |
| `JWT_SECRET` | Secreto utilizado para firmar y verificar los JWT. Es obligatorio. |
| `JWT_EXPIRES_IN` | Duración del JWT aceptada por `jsonwebtoken`, por ejemplo `1d`. Si se omite, el código no configura expiración. |
| `FRONTEND_URL` | URL del frontend utilizada para construir el enlace enviado por correo. |
| `EMAIL_HOST` | Host del servidor SMTP. |
| `EMAIL_PORT` | Puerto SMTP. El transporte utiliza conexión segura directa cuando vale `465`. |
| `EMAIL_USER` | Usuario de autenticación SMTP. |
| `EMAIL_PASSWORD` | Contraseña o clave de aplicación SMTP. |
| `EMAIL_FROM` | Remitente visible de los correos. |
| `GEMINI_API_KEY` | API key de Google Gemini. |
| `GEMINI_MODEL` | Modelo de Gemini. Si se omite, se utiliza `gemini-3-flash-preview`. |
| `GEMINI_MAX_OUTPUT_TOKENS` | Máximo de tokens de salida. Debe ser un entero positivo; el valor por defecto es `500`. |
| `AI_HISTORY_LIMIT` | Cantidad de mensajes recientes enviados como contexto a Gemini. Se limita al rango de 1 a 50 y por defecto vale `20`. |

El archivo `.env` está excluido de Git. Nunca deben publicarse secretos, contraseñas SMTP, cadenas de conexión ni API keys.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Ejecuta `src/server.js` con Nodemon y reinicio automático. |
| `npm start` | Ejecuta `src/server.js` con Node.js. |

## Arquitectura

```text
src/
├── config/          # Conexión a MongoDB y transporte SMTP
├── controllers/     # Adaptación entre HTTP y servicios
├── middleware/      # JWT, validación, 404 y errores
├── models/          # Esquemas de Mongoose
├── repositories/    # Consultas y operaciones de persistencia
├── routes/          # Endpoints y composición de middleware
├── services/        # Reglas de negocio, correo, chat y Gemini
├── utils/           # JWT y generación de slugs
├── validations/     # Reglas de express-validator
├── app.js           # Configuración de Express y prefijos /api
└── server.js        # Conexión a MongoDB e inicio del servidor
```

El flujo principal es:

```text
route → controller → service → repository → model
```

Las rutas aplican autenticación y validación; los controladores construyen la respuesta HTTP; los servicios contienen las reglas de negocio; los repositorios encapsulan Mongoose; y los modelos definen la estructura persistida.

## Modelos y relaciones

### User

Almacena nombre, correo único, contraseña hasheada, estado de verificación y token temporal de verificación. Los campos sensibles están excluidos de las consultas normales.

### Astro

Almacena nombre y slug únicos, tipo, descripciones, imagen, información astronómica opcional, estado activo y el usuario creador mediante `createdBy`, que referencia a `User`.

Tipos admitidos: `star`, `planet`, `moon`, `galaxy`, `nebula`, `black-hole`, `comet`, `asteroid`, `cluster` y `other`.

### Conversation

Referencia al propietario mediante `user` y al Astro mediante `astro`. Incluye título, estado `active` o `archived`, y fecha del último mensaje. Las consultas de conversaciones hacen `populate` del Astro con sus campos públicos.

### Message

Referencia una `Conversation` y almacena rol (`user` o `assistant`), contenido y metadatos. Los mensajes se ordenan cronológicamente al listarlos.

```text
User ──< Conversation >── Astro
              │
              └──< Message
```

Las eliminaciones actuales son físicas. El servicio no implementa eliminación en cascada de conversaciones o mensajes relacionados.

## Autenticación

1. El usuario se registra con nombre, correo y contraseña.
2. La contraseña se transforma con `bcrypt` usando un factor de costo de 10.
3. Se genera un token hexadecimal aleatorio de verificación con vigencia de 24 horas.
4. Nodemailer envía un enlace construido con `FRONTEND_URL`.
5. El usuario verifica el correo antes de iniciar sesión.
6. El login devuelve un JWT firmado con `JWT_SECRET`.
7. Las rutas protegidas esperan el encabezado `Authorization: Bearer <token>`.
8. `GET /api/auth/me` devuelve el usuario asociado al token vigente.

La expiración del JWT depende de `JWT_EXPIRES_IN`. Si se utiliza el valor del archivo de ejemplo, la vigencia es de un día.

## Flujo de verificación de correo

El registro genera un token de 64 caracteres hexadecimales y envía al usuario una URL con este formato:

```text
{FRONTEND_URL}/verify-email?token={token}
```

El frontend debe leer ese token y solicitar:

```http
GET /api/auth/verify-email/:token
```

Al verificarse correctamente, `isVerified` pasa a `true` y el token y su vencimiento se eliminan del usuario. El transporte SMTP es configurable; `.env.example` incluye Gmail como ejemplo, pero el código no está limitado a ese proveedor.

## Convenciones de la API

- URL base local: `http://localhost:3000/api`.
- Los cuerpos se envían como JSON.
- 🔒 indica que el endpoint requiere un JWT válido.
- Las listas incluyen `data.pagination` con `total`, `page`, `limit` y `totalPages`.
- Los recursos que pertenecen a un usuario se consultan junto con su propietario. Un recurso inexistente o ajeno responde como no encontrado.

### Respuesta exitosa general

```json
{
  "success": true,
  "message": "Mensaje opcional",
  "data": {}
}
```

## Endpoints

### Salud

| Método | Ruta | Auth | Descripción | Respuesta | Códigos |
|---|---|---:|---|---|---|
| `GET` | `/api/health` | No | Informa si la API está activa y si Mongoose está conectado. | `success`, `message`, `database` (`connected` o `disconnected`). | `200` |

### Auth

| Método | Ruta | Auth | Body | Respuesta resumida | Códigos principales |
|---|---|---:|---|---|---|
| `POST` | `/api/auth/register` | No | `name`, `email`, `password` | Usuario sin contraseña y mensaje para verificar el correo. | `201`, `400`, `409`, `500` |
| `GET` | `/api/auth/verify-email/:token` | No | — | Confirma la verificación del correo. | `200`, `400` |
| `POST` | `/api/auth/login` | No | `email`, `password` | Usuario autenticado y JWT en `data.token`. | `200`, `400`, `401`, `403` |
| `GET` | `/api/auth/me` | 🔒 | — | Usuario autenticado en `data.user`. | `200`, `401` |

Validaciones relevantes:

- `name`: entre 2 y 50 caracteres.
- `email`: formato válido y único.
- `password`: mínimo 8 caracteres, con al menos una mayúscula, una minúscula y un número.
- El login devuelve `403` si el correo todavía no fue verificado.

### Astros

| Método | Ruta | Auth | Body o query | Respuesta resumida | Códigos principales |
|---|---|---:|---|---|---|
| `GET` | `/api/astros` | No | Query opcional: `page`, `limit`, `search`, `type`, `isActive` | Astros y paginación. | `200` |
| `GET` | `/api/astros/:id` | No | — | Astro en `data.astro`. | `200`, `400`, `404` |
| `GET` | `/api/astros/slug/:slug` | No | — | Astro en `data.astro`. | `200`, `400`, `404` |
| `POST` | `/api/astros` | 🔒 | Campos de creación indicados abajo. | Astro creado en `data.astro`. | `201`, `400`, `401`, `409` |
| `PUT` | `/api/astros/:id` | 🔒 | Uno o más campos editables. | Astro actualizado en `data.astro`. | `200`, `400`, `401`, `404`, `409` |
| `DELETE` | `/api/astros/:id` | 🔒 | — | Mensaje de eliminación. | `200`, `400`, `401`, `404` |

El listado usa página 1 y límite 10 por defecto; el límite máximo efectivo es 50. `search` busca en nombre, descripción corta y descripción. `isActive` acepta `true` o `false`.

Campos obligatorios para crear:

| Campo | Restricción |
|---|---|
| `name` | String entre 2 y 80 caracteres; debe ser único. |
| `type` | Uno de los tipos de Astro admitidos. |
| `description` | String entre 20 y 1500 caracteres. |
| `shortDescription` | String entre 10 y 250 caracteres. |
| `imageUrl` | URL válida. |

Campos opcionales: `scientificName` (máximo 150), `distance` (máximo 150), `constellation` (máximo 100) e `isActive` (booleano, `true` por defecto). El backend genera `slug` y `createdBy`; no deben enviarse.

La actualización acepta únicamente `name`, `type`, `description`, `shortDescription`, `imageUrl`, `scientificName`, `distance`, `constellation` e `isActive`. Si cambia el nombre, el slug se regenera.

### Conversations

Todos los endpoints de Conversations requieren autenticación y operan únicamente sobre conversaciones del usuario autenticado.

| Método | Ruta | Auth | Body o query | Respuesta resumida | Códigos principales |
|---|---|---:|---|---|---|
| `GET` | `/api/conversations` | 🔒 | Query opcional: `page`, `limit`, `search`, `status`, `astro` | Conversaciones con Astro poblado y paginación. | `200`, `400`, `401` |
| `GET` | `/api/conversations/:id` | 🔒 | — | Conversación con Astro poblado. | `200`, `400`, `401`, `404` |
| `POST` | `/api/conversations` | 🔒 | `astro`, `title` | Conversación activa creada. | `201`, `400`, `401`, `404` |
| `PUT` | `/api/conversations/:id` | 🔒 | Al menos uno: `title`, `status` | Conversación actualizada. | `200`, `400`, `401`, `404` |
| `DELETE` | `/api/conversations/:id` | 🔒 | — | Mensaje de eliminación. | `200`, `400`, `401`, `404` |

El título debe tener entre 2 y 120 caracteres. `status` acepta `active` o `archived`. No se puede crear una conversación con un Astro inactivo. El listado admite `page` desde 1, `limit` entre 1 y 50, `search` de hasta 120 caracteres, `status` y un ID de Astro válido.

### Messages

Todos los endpoints de Messages requieren autenticación y comprueban que la conversación pertenezca al usuario.

| Método | Ruta | Auth | Body o query | Respuesta resumida | Códigos principales |
|---|---|---:|---|---|---|
| `POST` | `/api/messages/conversation/:conversationId` | 🔒 | `role`, `content`, `metadata` opcional | Mensaje creado en `data.message`. | `201`, `400`, `401`, `404` |
| `GET` | `/api/messages/conversation/:conversationId` | 🔒 | Query opcional: `page`, `limit` | Mensajes cronológicos y paginación. | `200`, `400`, `401`, `404` |
| `GET` | `/api/messages/:messageId` | 🔒 | — | Mensaje en `data.message`. | `200`, `400`, `401`, `404` |
| `DELETE` | `/api/messages/:messageId` | 🔒 | — | Mensaje de eliminación. | `200`, `400`, `401`, `404` |

`role` admite `user` o `assistant`; `content` debe tener entre 1 y 10000 caracteres; y `metadata`, si se envía, debe ser un objeto. No se pueden agregar mensajes a una conversación archivada. El listado usa un límite de 20 por defecto y acepta entre 1 y 100.

### Chat con Gemini

| Método | Ruta | Auth | Body | Respuesta resumida | Códigos principales |
|---|---|---:|---|---|---|
| `POST` | `/api/chat/conversation/:conversationId` | 🔒 | `content` | Mensaje del usuario y respuesta del asistente. | `201`, `400`, `401`, `404`, `502`, `503` |

`content` debe contener entre 1 y 4000 caracteres. La conversación debe pertenecer al usuario, estar activa y conservar una referencia válida al Astro.

En una operación exitosa, el backend:

1. Guarda el mensaje del usuario.
2. Actualiza `lastMessageAt`.
3. Recupera el historial reciente configurado por `AI_HISTORY_LIMIT`.
4. Construye instrucciones de sistema con los datos disponibles del Astro.
5. Solicita una respuesta al modelo configurado en `GEMINI_MODEL`.
6. Guarda el mensaje del asistente con `metadata.provider = "google"` y el modelo utilizado.

La API key permanece exclusivamente en el backend. Una respuesta inválida o un fallo del proveedor se informa como `502`; la ausencia de configuración de Gemini se informa como `503`.

## Ejemplos de uso

Los ejemplos utilizan datos ficticios y placeholders. Definí primero la URL base:

```bash
BASE_URL=http://localhost:3000/api
```

### Registro

```bash
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Demo",
    "email": "demo@example.com",
    "password": "ClaveDemo1"
  }'
```

### Login

```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "ClaveDemo1"
  }'
```

### Autorización Bearer

Guardá manualmente el token ficticio o devuelto por login sin publicarlo:

```bash
TOKEN="REEMPLAZAR_CON_JWT"
curl "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

### Crear un Astro

```bash
curl -X POST "$BASE_URL/astros" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marte de demostración",
    "type": "planet",
    "shortDescription": "Planeta rocoso utilizado como ejemplo de la API.",
    "description": "Marte es un planeta rocoso del sistema solar utilizado aquí únicamente como dato ficticio de demostración.",
    "imageUrl": "https://example.com/images/marte-demo.jpg",
    "scientificName": "Mars",
    "distance": "Dato de demostración",
    "constellation": null,
    "isActive": true
  }'
```

### Crear una conversación

```bash
ASTRO_ID="REEMPLAZAR_CON_ID_DEL_ASTRO"
curl -X POST "$BASE_URL/conversations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"astro\":\"$ASTRO_ID\",\"title\":\"Preguntas sobre Marte\"}"
```

### Enviar contenido a Gemini

```bash
CONVERSATION_ID="REEMPLAZAR_CON_ID_DE_LA_CONVERSACION"
curl -X POST "$BASE_URL/chat/conversation/$CONVERSATION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"¿Por qué Marte se ve rojo?"}'
```

## Manejo de errores

Los errores generales siguen esta estructura:

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

Los errores de validación agregan el detalle por campo:

```json
{
  "success": false,
  "message": "Datos inválidos",
  "errors": [
    {
      "field": "title",
      "message": "El título debe tener entre 2 y 120 caracteres."
    }
  ]
}
```

| Código | Uso en el proyecto |
|---:|---|
| `400` | Entrada inválida o regla de negocio incumplida, como escribir en una conversación archivada. |
| `401` | JWT ausente, mal formado, inválido o vencido; también credenciales incorrectas. |
| `403` | Intento de login con correo todavía no verificado. |
| `404` | Ruta o recurso no encontrado. También oculta recursos que no pertenecen al usuario. |
| `409` | Conflictos de unicidad en correo, nombre o slug. |
| `500` | Error interno o fallo al enviar el correo de verificación. |
| `502` | Gemini no produjo una respuesta utilizable o falló la consulta al proveedor. |
| `503` | La integración de inteligencia artificial no está configurada. |

El proyecto no implementa actualmente una respuesta `429` propia ni middleware de rate limiting.

## Colección de Postman

La colección y el environment local se encuentran en:

```text
docs/postman/AstroChat.postman_collection.json
docs/postman/AstroChat.local.postman_environment.json
```

Ambos archivos utilizan variables reutilizables y datos ficticios. El environment no contiene credenciales ni tokens reales.

## Deploy en Render

El backend puede configurarse como un **Web Service** de Render con estos valores:

| Campo | Valor |
|---|---|
| Runtime | `Node` |
| Root Directory | Dejar vacío; `package.json` está en la raíz del repositorio. |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Render proporciona `PORT` al Web Service y configura `NODE_ENV=production` para el runtime de Node. El código ya utiliza `process.env.PORT` con fallback local a `3000`; no es necesario fijar el puerto manualmente ni agregar comportamiento específico para `NODE_ENV`.

### Variables para cargar en Render

Obligatorias para todas las funcionalidades:

- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `EMAIL_FROM`
- `GEMINI_API_KEY`

Configurables, con fallback o comportamiento definido por el código:

- `JWT_EXPIRES_IN`
- `GEMINI_MODEL`
- `GEMINI_MAX_OUTPUT_TOKENS`
- `AI_HISTORY_LIMIT`

`FRONTEND_URL` debe contener el origen público del frontend desplegado. CORS admite ese origen, `http://localhost:5173` para desarrollo y clientes sin encabezado `Origin`, como Postman o Thunder Client. No se habilitan credenciales CORS porque la autenticación utiliza Bearer tokens.

El correo construye el enlace `{FRONTEND_URL}/verify-email?token={token}`. El backend expone el endpoint que consume el token, pero el frontend actual todavía no implementa la pantalla `/verify-email`; esa integración debe completarse para que el usuario pueda finalizar la verificación desde el enlace recibido.

No se necesita Dockerfile ni `render.yaml` para la configuración manual descrita.

Backend desplegado: **PENDIENTE**

Frontend desplegado: **PENDIENTE**

## Usuario de prueba

Email: **PENDIENTE**

Password: **PENDIENTE**

La cuenta de prueba deberá estar verificada antes de iniciar sesión.

## Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt y nunca se devuelven en las respuestas normales.
- Los JWT se firman con una variable de entorno y pueden configurarse con expiración.
- Las entradas se validan con `express-validator` y los modelos vuelven a aplicar restricciones mediante Mongoose.
- Los recursos privados se consultan junto con el ID del usuario autenticado.
- CORS permite el frontend local, el origen configurado en `FRONTEND_URL` y clientes sin encabezado `Origin`.
- El contenido dinámico del correo se escapa antes de insertarse en HTML.
- `.env` está ignorado por Git.
- Las credenciales SMTP, URI de MongoDB, secreto JWT y API key de Gemini no deben exponerse en el frontend, README, commits ni logs.
- El proyecto no implementa roles; cualquier usuario autenticado puede utilizar las operaciones protegidas de Astros.

## Estado del proyecto

Las funcionalidades principales del trabajo integrador están implementadas: autenticación con verificación de correo, CRUD de Astros, CRUD de Conversations, creación/listado/detalle/eliminación de Messages y chat persistente integrado con Gemini.

El despliegue y las credenciales controladas de demostración permanecen pendientes de completar para la entrega.
