import multer from 'multer';

const fileSize = 10 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, png, jpeg or webp images are allowed'));
  }
}

const storage = multer.memoryStorage();

const fileUploader = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize }
});

export default fileUploader;