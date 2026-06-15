import { Router } from 'express';
import upload from '../middleware/upload.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Rota para upload de uma única imagem
router.post('/single', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    // Gerar a URL pública da imagem
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      message: 'Imagem enviada com sucesso!',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para upload de múltiplas imagens (max 5)
router.post('/multiple', authenticateToken, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    // Gerar URLs públicas
    const imageUrls = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);

    res.status(201).json({
      message: 'Imagens enviadas com sucesso!',
      urls: imageUrls,
      filenames: (req.files as Express.Multer.File[]).map(file => file.filename)
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
