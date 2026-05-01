import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/response';

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gotogether/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  } as any,
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
