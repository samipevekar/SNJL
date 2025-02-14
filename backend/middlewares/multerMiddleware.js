import path from "path";
import multer from "multer";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 60 * 1024 * 1024 }, // 60 MB upload limit
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (_req, file, cb) => {
      cb(null, file.originalname); // File ka original name rakhna
    },
  }),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Allowed file extensions
    const allowedExtensions = [
      ".jpg", ".jpeg", ".png", ".gif", ".bmp",  // Images
      ".mp4", ".mkv", ".avi", ".mov", // Videos
      ".mp3", ".wav", ".m4a", ".flac", // Audio
      ".pdf", ".doc", ".docx", ".txt", ".ppt", ".xlsx", ".csv", // Documents
      ".zip", ".tar", ".rar" // Compressed files
    ];

    if (!allowedExtensions.includes(ext)) {
      cb(new Error(`Unsupported file type ${ext}`), false);
      return;
    }
    cb(null, true); // Accept the file if extension is allowed
  },
});

export default upload;
