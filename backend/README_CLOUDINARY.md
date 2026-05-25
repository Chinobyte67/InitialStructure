# Cloudinary upload helper (Express)

Estos archivos implementan un pequeño servidor Express para recibir uploads de audio y subirlos a Cloudinary sin escribir archivos al disco (usa `multer.memoryStorage`).

Archivos añadidos:
- `cloudinary.js` — configura `cloudinary` usando variables de entorno.
- `cloudinary_server.js` — servidor Express con ruta `POST /upload-song` que espera el campo `song`.

Dependencias necesarias (elige uno):

- Con Bun:
```
cd backend
bun add express multer cloudinary dotenv
```

- Con npm/yarn:
```
cd backend
npm install express multer cloudinary dotenv
# o
yarn add express multer cloudinary dotenv
```

Variables de entorno (colocar en `backend/.env` o en tu entorno):

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
# opcional: CLOUDINARY_SERVER_PORT=3001
```

Ejecución (con Bun):
```
bun backend/cloudinary_server.js
```

Ejecución (con Node después de `npm install`):
```
node backend/cloudinary_server.js
```

Uso desde frontend (ejemplo fetch):

```
const form = new FormData();
form.append('song', fileInput.files[0]);
const res = await fetch('http://localhost:3001/upload-song', { method: 'POST', body: form });
const data = await res.json();
```

Notas:
- Si preferís no tener credenciales en el backend, podés usar uploads unsigned desde el frontend (ya implementado en `frontend/src/lib/cloudinary.ts`).
- El servidor de ejemplo sube con `resource_type: 'video'` porque Cloudinary trata audio como video.
