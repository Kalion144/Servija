import { Router } from 'express';
import upload from '../middleware/upload.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

const router = Router();

// Função auxiliar para pegar o caminho relativo
const getRelativeUrl = (file: Express.Multer.File) => {
  const relativePath = path.relative(uploadDir, file.path);
  return `/uploads/${relativePath.replace(/\\/g, '/')}`; // Garantir barras no Windows
};

// Rota para upload de uma única imagem
router.post('/single', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    res.status(201).json({
      message: 'Imagem enviada com sucesso!',
      url: getRelativeUrl(req.file),
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

    const files = req.files as Express.Multer.File[];
    const imageUrls = files.map(file => getRelativeUrl(file));

    res.status(201).json({
      message: 'Imagens enviadas com sucesso!',
      urls: imageUrls,
      filenames: files.map(file => file.filename)
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
