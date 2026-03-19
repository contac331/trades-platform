const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure services subdirectory exists
const servicesUploadDir = path.join(uploadDir, 'services');
if (!fs.existsSync(servicesUploadDir)) {
  fs.mkdirSync(servicesUploadDir, { recursive: true });
}

// Ensure profiles subdirectory exists
const profilesUploadDir = path.join(uploadDir, 'profiles');
if (!fs.existsSync(profilesUploadDir)) {
  fs.mkdirSync(profilesUploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Check the route to determine destination
    if (req.route.path === '/services' || req.originalUrl.includes('/upload/services')) {
      cb(null, servicesUploadDir);
    } else {
      // Default to profiles for general uploads
      cb(null, profilesUploadDir);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    // Use different prefixes based on upload type
    let prefix = 'profile-';
    if (req.route.path === '/services' || req.originalUrl.includes('/upload/services')) {
      prefix = 'service-';
    }
    
    cb(null, prefix + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000 // 5MB default
  },
  fileFilter: fileFilter
});

module.exports = {
  upload,
  uploadDir,
  servicesUploadDir
};
