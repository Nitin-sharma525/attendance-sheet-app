const multer = require("multer");
const path = require('path')
const fs =require('fs')


const storage = multer.diskStorage({
  destination: function (req, file, cd) {
    cd(null, 'uploads/')
    if (file.mimetype === 'image/jepg' || file.mimetype === 'image/png') {

    } else {

    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
  })
  const upload =multer({storage:storage})
  module.exports=upload;
