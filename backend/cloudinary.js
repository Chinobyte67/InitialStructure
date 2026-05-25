const cloudinary = require('cloudinary').v2;
const path = require('path');
const dotenv = require('dotenv');

// Cargar .env desde la raíz del proyecto backend (si existe)
dotenv.config({ path: path.join(__dirname, '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
