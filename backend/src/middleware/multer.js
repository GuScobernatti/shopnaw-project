const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v2: cloudinary } = require("cloudinary");
const { v4: uuidv4 } = require("uuid");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "shopnaw_products", // Nome da pasta no Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) => {
      const originalName = file.originalname
        .split(".")[0]
        .replace(/[^a-zA-Z0-9]/g, "");
      return `${originalName}_${uuidv4()}`;
    },
  },
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
