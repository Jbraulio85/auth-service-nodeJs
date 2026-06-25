import multer from 'multer';
import { config } from '../configs/config.js';

const fileFilter = (req, file, cb) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'
    ),
    false
  );
};

// Memoria: compatible con Vercel serverless (filesystem de solo lectura)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxSize,
  },
  fileFilter,
});

export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande',
        error: `El tamaño máximo permitido es ${config.upload.maxSize / (1024 * 1024)}MB`,
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado',
        error: error.message,
      });
    }
  }

  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido',
      error: 'Solo se permiten imágenes (JPEG, JPG, PNG, GIF)',
    });
  }

  next(error);
};
