import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import path from 'path';
import { config } from '../configs/config.js';
import fs from 'fs/promises';

// FIX: Bypass SSL (Cloudinary, etc.)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadImage = async (filePath, fileName) => {
  try {
    const folder = config.cloudinary.folder;
    const options = {
      public_id: fileName,
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    };

    const result = await cloudinary.uploader.upload(filePath, options);

    // Eliminar archivo local después de subir exitosamente
    try {
      await fs.unlink(filePath);
    } catch {
      console.warn('Warning: Could not delete local file:', filePath);
    }

    if (result.error) {
      throw new Error(`Error uploading image: ${result.error.message}`);
    }

    return `v${result.version}/${result.public_id}.${result.format}`;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error?.message || error);

    try {
      await fs.unlink(filePath);
    } catch {
      console.warn('Warning: Could not delete local file after upload error');
    }

    throw new Error(
      `Failed to upload image to Cloudinary: ${error?.message || ''}`
    );
  }
};

export const uploadImageBuffer = async (buffer, fileName) => {
  const folder = config.cloudinary.folder;
  const options = {
    public_id: fileName,
    folder,
    resource_type: 'image',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(`v${result.version}/${result.public_id}.${result.format}`);
      }
    );

    uploadStream.end(buffer);
  });
};

export const uploadImageFromMulterFile = async (file) => {
  const ext = path.extname(file.originalname || '') || '.jpg';
  const randomHex = crypto.randomBytes(6).toString('hex');
  const fileName = `profile-${randomHex}${ext}`;

  if (file.buffer) {
    return uploadImageBuffer(file.buffer, fileName);
  }

  if (file.path) {
    return uploadImage(file.path, fileName);
  }

  throw new Error('Archivo de imagen invalido');
};

export const deleteImage = async (imagePath) => {
  try {
    if (!imagePath || imagePath === config.cloudinary.defaultAvatarPath) {
      return true;
    }

    let publicId = String(imagePath);
    if (publicId.startsWith('v')) {
      publicId = publicId.replace(/^v\d+\//, '');
    }
    publicId = publicId.replace(/\.[a-z0-9]+$/i, '');

    const result = await cloudinary.uploader.destroy(publicId);
    return result.result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

export const getFullImageUrl = (imagePath) => {
  if (!imagePath) {
    return getDefaultAvatarUrl();
  }

  const trimmed = String(imagePath).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  const baseUrl = config.cloudinary.baseUrl;

  if (trimmed.startsWith('v')) {
    return `${baseUrl}${trimmed}`;
  }

  if (
    trimmed === config.cloudinary.defaultAvatarPath ||
    trimmed === getDefaultAvatarPath() ||
    trimmed === config.cloudinary.defaultAvatarPath.split('/').pop()
  ) {
    const version = 'v1774318088';
    const filename = config.cloudinary.defaultAvatarPath.split('/').pop();
    return `${baseUrl}${version}/${filename}.png`;
  }

  const folder = config.cloudinary.folder;
  const pathToUse = trimmed.includes('/') ? trimmed : `${folder}/${trimmed}`;

  return `${baseUrl}w_400,h_400,c_fill,g_auto,q_auto,f_auto/${pathToUse}`;
};

export const getDefaultAvatarUrl = () => {
  const defaultPath = config.cloudinary.defaultAvatarPath;
  return getFullImageUrl(defaultPath);
};

export const getDefaultAvatarPath = () => {
  // Siempre devolver la ruta completa (folder/filename, sin extensión)
  const folder = process.env.CLOUDINARY_FOLDER || config.cloudinary.folder;
  const filename =
    process.env.CLOUDINARY_DEFAULT_AVATAR_FILENAME ||
    config.cloudinary.defaultAvatarPath.split('/').pop();
  return `${folder}/${filename}`;
};

export default {
  uploadImage,
  uploadImageBuffer,
  uploadImageFromMulterFile,
  deleteImage,
  getFullImageUrl,
  getDefaultAvatarUrl,
  getDefaultAvatarPath,
};
