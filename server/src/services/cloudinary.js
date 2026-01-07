import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage para productos
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lapulperia/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto:good' }
    ],
  },
});

// Storage para logos de pulperias
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lapulperia/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'center', quality: 'auto:good' }
    ],
  },
});

// Storage para banners
const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lapulperia/banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 400, crop: 'fill', gravity: 'center', quality: 'auto:good' }
    ],
  },
});

// Storage para CVs
const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lapulperia/cvs',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
  },
});

// Storage para catalogo de servicios
const serviceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lapulperia/services',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto:good' }
    ],
  },
});

// Storage para historia del negocio
const storyStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lapulperia/stories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto:good' }
    ],
  },
});

export const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

export const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const uploadBanner = multer({
  storage: bannerStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

export const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const uploadService = multer({
  storage: serviceStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

export const uploadStory = multer({
  storage: storyStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

export default cloudinary;
