import multer from 'multer';

// Konfiguracja Multer do przechowywania plików w pamięci
// Dzięki temu możemy przesłać plik bezpośrednio do Cloudinary bez zapisywania na dysku
const storage = multer.memoryStorage();

// Filtr akceptujący tylko pliki PDF
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Tylko pliki PDF są akceptowane!'));
  }
};

// Filtr akceptujący tylko obrazy
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Tylko pliki obrazów są akceptowane!'));
  }
};

// Eksportuj skonfigurowany multer
export const uploadCV = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  }
});

export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB max dla obrazów
  }
});
