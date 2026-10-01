import express from "express";
import multer from "multer";
import sharp from "sharp";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import cloudinary from "../config/cloudinary.js";
import requireEmailVerified from "../middleware/requireEmailVerified.js";

const router = express.Router();

// Quality gates — catch the most obviously broken uploads automatically.
// Real document legibility still relies on admin review at verification time.
const MIN_IMAGE_BYTES = 15 * 1024; // catches blank/near-blank or corrupt images
const MIN_IMAGE_DIMENSION = 500; // px — catches tiny, unreadable scans
const MIN_PDF_BYTES = 3 * 1024; // catches empty/corrupt PDFs

// Store the original upload in memory — we compress it
// ourselves before sending it up to Cloudinary.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only image files or PDFs are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    // Generous cap for real phone photos — the actual stored
    // file ends up much smaller after compression below.
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

const uploadBufferToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "bookbeautiq", ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

router.post("/", authMiddleware, roleMiddleware("business", "admin"), requireEmailVerified, (req, res) => {
  upload.single("image")(req, res, async (error) => {
    if (error) {
      console.error("File upload error:", error);

      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "File is too large. Please upload something under 10MB."
          : error.message || "File upload failed.";

      return res.status(400).json({ message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const isPdf = req.file.mimetype === "application/pdf";

    try {
      if (isPdf) {
        // ==========================================
        // PDF — no image processing, basic sanity check only
        // ==========================================

        if (req.file.buffer.length < MIN_PDF_BYTES) {
          return res.status(400).json({
            message: "This PDF appears to be empty or corrupted. Please upload a valid document.",
          });
        }

        const result = await uploadBufferToCloudinary(req.file.buffer, {
          resource_type: "auto",
        });

        return res.status(201).json({
          message: "Document uploaded successfully.",
          imageUrl: result.secure_url,
        });
      }

      // ==========================================
      // IMAGE — quality gates, then compress as before
      // ==========================================

      if (req.file.buffer.length < MIN_IMAGE_BYTES) {
        return res.status(400).json({
          message: "This image looks blank or too small. Please upload a clear photo of the full document.",
        });
      }

      const metadata = await sharp(req.file.buffer).metadata();

      if (
        (metadata.width && metadata.width < MIN_IMAGE_DIMENSION) ||
        (metadata.height && metadata.height < MIN_IMAGE_DIMENSION)
      ) {
        return res.status(400).json({
          message: "This image is too small to read clearly. Please upload a higher-resolution photo.",
        });
      }

      // Resize to a sensible max width and compress to high-quality
      // JPEG — keeps images sharp while cutting file size dramatically
      // compared to an untouched phone photo.
      const compressedBuffer = await sharp(req.file.buffer)
        .rotate() // respects EXIF orientation from phone cameras
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const result = await uploadBufferToCloudinary(compressedBuffer, {
        resource_type: "image",
      });

      res.status(201).json({
        message: "Image uploaded successfully.",
        imageUrl: result.secure_url,
      });
    } catch (processingError) {
      console.error("File processing error:", processingError);
      res.status(500).json({ message: "Failed to process the uploaded file." });
    }
  });
});

export default router;