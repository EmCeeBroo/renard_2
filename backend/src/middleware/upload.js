import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ruta absoluta para la carpeta de uploads
    const uploadDir = path.join(__dirname, '../app/assets/img/restaurantes/');
    
    // Crear carpeta si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitizar el nombre del archivo
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const nameWithoutExtension = path.basename(originalName, extension);
    
    // Remover espacios y caracteres especiales
    const sanitizedName = nameWithoutExtension
      .replaceAll(/\s+/g, '_')
      //.replaceAll(/[^a-zA-Z0-9_]/g, '')
      .replaceAll(/[^\w]/g, '')
      .toLowerCase();
    
    // Crear nombre único
    //const uniqueName = `${sanitizedName}_${Date.now()}${extension}`;

    const uniqueName = `${sanitizedName}${extension}`;
    
    cb(null, uniqueName);
  }
});

// Filtro para solo aceptar imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

export default upload;