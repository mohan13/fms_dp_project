import multer from 'multer';
import fs from 'fs';
import path from 'node:path';
import type { Request } from 'express';

// ── Ensure temp directory exists ──────────────────────────────────────────────
const tempDir = './public/temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: any) {
    cb(null, tempDir);
  },

  filename: function (req: Request, file: Express.Multer.File, cb: any) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

// ── File type filter ──────────────────────────────────────────────────────────
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: any,
): void => {
  const allowedExtensions = /jpeg|jpg|webp/;
  const allowedMimeTypes = /image\/jpeg|image\/jpg|image\/webp/;

  const isExtValid = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const isMimeValid = allowedMimeTypes.test(file.mimetype);

  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed: jpeg, jpg, png, webp'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fieldSize: 2 * 1024 * 1024, //2MB
  },
  fileFilter,
});
