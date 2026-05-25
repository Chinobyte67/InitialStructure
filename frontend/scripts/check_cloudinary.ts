import { readFileSync } from 'fs';
import { join } from 'path';

function parseDotEnv(text: string) {
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

async function main() {
  const envPath = join(process.cwd(), '.env');
  console.log('Leyendo .env en:', envPath);
  let text = '';
  try {
    text = readFileSync(envPath, 'utf8');
  } catch (e) {
    console.error('.env no encontrado en', envPath);
    process.exit(2);
  }

  const env = parseDotEnv(text);
  const CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = env.VITE_CLOUDINARY_UPLOAD_PRESET;

  console.log('VITE_CLOUDINARY_CLOUD_NAME:', CLOUD_NAME ? CLOUD_NAME : '(no definido)');
  console.log('VITE_CLOUDINARY_UPLOAD_PRESET:', UPLOAD_PRESET ? '(definido)' : '(no definido)');

  if (!CLOUD_NAME) {
    console.error('Falta VITE_CLOUDINARY_CLOUD_NAME en .env — completa la variable y reintenta.');
    process.exit(3);
  }

  // Probe: pedir metadata pública (no requiere credenciales) para comprobar que el host responde.
  const pingUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload?max_results=1`;
  console.log('Haciendo petición de comprobación a:', pingUrl);

  try {
    // Bun provides global `fetch`; Node 18+ also has fetch. We'll use the global one.
    const res = await fetch(pingUrl, { method: 'GET' });
    console.log('Código HTTP:', res.status);
    const body = await res.text();
    console.log('Respuesta (primeros 1000 caracteres):\n', body.slice(0, 1000));
    if (res.ok) console.log('Cloudinary accesible y respondió OK.');
    else console.log('Cloudinary respondió con código de estado (esperable si requiere autenticación):', res.status);
  } catch (err) {
    console.error('Error al contactar Cloudinary:', err);
    process.exit(4);
  }
}

main();
