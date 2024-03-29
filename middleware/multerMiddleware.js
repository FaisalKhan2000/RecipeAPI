import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // set the directory where uploaded files will be stored
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname;
    // set the name of the uploaded file
    cb(null, fileName);
  },
});

// Configure multer upload settings with size limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024, // 1MB (in bytes)
  },
  fileFilter: (req, file, cb) => {
    // Validate file type if needed
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
});

export default upload;
