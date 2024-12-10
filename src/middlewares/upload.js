const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: function (req, file, cb) {
    console.log('File received in middleware:', file); // Log to confirm the file is hitting the middleware
    checkFileType(file, cb);
  },
}).single('file'); // Ensure 'file' matches the FormData key in the frontend

function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /xls|xlsx|csv/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Excel or CSV Files Only!');
  }
}

module.exports = upload;
