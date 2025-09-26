const multer = require('multer');
const path = require('path');
const fs = require('fs');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype ==='images/jpeg' ||file.mimetype ==='application/pdf') {
  
        
            } else {
                  cb(new Error('I const upload = multer({ storage: storage });nvalid file type. Only JPEG,  and PNG are allowed.'), false);
            }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
    const upload = multer({ 
        storage: storage,
        limits: { fileSize: 1024 * 1024 * 5 }
    });

  }
});
const upload = multer({ storage: storage });
module.exports = upload;