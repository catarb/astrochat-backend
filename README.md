# AstroChat Backend

API backend del proyecto integrador Full-Stack AstroChat. Utiliza MongoDB mediante Mongoose y mantiene una arquitectura por capas preparada para el flujo `routes → controllers → services → repositories`.

## Tecnologías

- Node.js
- Express
- MongoDB con Mongoose
- JavaScript con módulos ES
- CORS y dotenv

## Requisitos previos

- Node.js 18 o superior
- npm
- MongoDB local o una instancia remota disponible para las próximas etapas

## Instalación

Desde la carpeta `astrochat-backend`, instalá las dependencias:

```bash
npm install
```

## Variables de entorno

Creá un archivo `.env` a partir de `.env.example`.

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Luego configurá `MONGODB_URI` con la dirección de tu base de datos. El archivo `.env` no se versiona.

Ejemplo para MongoDB local:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/astrochat
```

Ejemplo genérico para MongoDB Atlas (reemplazá los valores entre ángulos por los tuyos y no publiques las credenciales):

```env
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/astrochat
```

## Ejecución en desarrollo

```bash
npm run dev
```

Por defecto, la API quedará disponible en `http://localhost:3000`.

## Probar el endpoint de salud

Con el servidor en ejecución, abrí `http://localhost:3000/api/health` o ejecutá:

```bash
curl http://localhost:3000/api/health
```

Si MongoDB está conectado, la respuesta esperada es:

```json
{
  "success": true,
  "message": "AstroChat API funcionando",
  "database": "connected"
}
```

El valor de `database` será `disconnected` cuando Mongoose no tenga una conexión activa.
