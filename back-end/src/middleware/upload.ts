import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import logger from "../config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório para armazenar uploads
const uploadDir = path.join(__dirname, "../../uploads");

// Criar diretório se não existir
try {
  await fs.access(uploadDir);
} catch {
  await fs.mkdir(uploadDir, { recursive: true });
}

// Configuração do storage do multer
const storage = multer.diskStorage({
  destination: (req: any, file, cb) => {
    let dest = uploadDir;
    // Check if the original URL is for the profile endpoint
    if (req.originalUrl && req.originalUrl.includes("/profile")) {
      const userType = req.user?.userType || "CLIENTE";
      if (userType === "CLIENTE") {
        dest = path.join(uploadDir, "profile/cliente");
      } else {
        dest = path.join(uploadDir, "profile/profissional");
      }
    }
    // Criar diretório se não existir
    fs.mkdir(dest, { recursive: true })
      .then(() => cb(null, dest))
      .catch((err) => cb(err, dest));
  },
  filename: (req, file, cb) => {
    // Gerar um nome único para o arquivo com extensão jpg para segurança
    const uniqueName = `${uuidv4()}-${Date.now()}.jpg`;
    cb(null, uniqueName);
  },
});

// Função auxiliar para pegar o caminho relativo do diretório de upload
const getRelativePath = (fullPath: string) => {
  return path.relative(uploadDir, fullPath);
};

// Filtrar tipos de arquivos permitidos (apenas imagens)
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Apenas arquivos de imagem são permitidos!"));
  }
};

// Middleware para processar imagens com sharp após o upload
export const processImage = async (
  req: any,
  res: any,
  next: any
) => {
  if (!req.file) {
    return next();
  }

  try {
    // Reprocessar a imagem com sharp para remover metadados maliciosos
    await sharp(req.file.path)
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .rotate() // Auto-rotate based on EXIF data
      .jpeg({ quality: 85 })
      .toFile(`${req.file.path}.tmp`);

    // Substituir o arquivo original pelo processado
    await fs.rename(`${req.file.path}.tmp`, req.file.path);
    logger.info({ file: req.file.filename }, "Imagem processada com sucesso");
    next();
  } catch (error) {
    logger.error({ error, file: req.file.filename }, "Erro ao processar imagem");
    res.status(500).json({ erro: "Erro ao processar imagem" });
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: fileFilter,
});

export default upload;
