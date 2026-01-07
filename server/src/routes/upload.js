import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadProduct, uploadLogo, uploadBanner } from '../services/cloudinary.js';

const router = express.Router();

// Generic image upload endpoint
router.post('/image', authenticate, uploadProduct.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No se proporcionó imagen' } });
    }

    res.json({
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: { message: 'Error al subir imagen' } });
  }
});

export default router;
