import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório para armazenar uploads
const uploadDir = path.join(__dirname, "../../uploads");

// Criar diretório se não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Gerar um nome único para o arquivo
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

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

// Configuração do multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: fileFilter,
});

export default upload;
