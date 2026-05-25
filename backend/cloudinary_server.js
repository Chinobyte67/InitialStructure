const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cloudinary = require('./cloudinary');

const app = express();

// Recomendado: usar memoria para no escribir archivos al disco
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());

// Ruta para subir canción (desde formulario multipart/form-data)
app.post('/upload-song', upload.single('song'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envió ningún archivo' });

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder: 'canciones' },
      (err, result) => {
        if (err) {
          console.error('Cloudinary upload error:', err);
          return res.status(500).json({ error: err.message || err });
        }
        return res.json({
          success: true,
          message: 'Canción subida correctamente',
          url: result.secure_url,
          public_id: result.public_id,
          duration: result.duration,
        });
      }
    );

    stream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de prueba simple
app.get('/ping', (req, res) => res.json({ ok: true }));

const PORT = process.env.CLOUDINARY_SERVER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Cloudinary upload server running on http://localhost:${PORT}`);
});
