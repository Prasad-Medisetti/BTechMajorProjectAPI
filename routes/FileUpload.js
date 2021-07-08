const mongoose = require("mongoose"),
	express = require("express"),
	router = express.Router(),
  multer = require("multer"),
  path = require("path");

const filesPath = path.join("./public/uploads/files");

let filestorage = multer.diskStorage({
	designation : function (req, file, cb) {
		cb(null, path.join(__dirname, '..', filesPath));
	},
	filename : function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now() + "." + file.originalname.split(".")[1]);
	}
})

let allowedFiles = function (req, file, cb) {
	// Accept images only
	if (!file.originalname.match(/\.(pdf|doc|txt|jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
		req.fileValidationError = 'Only pdf | doc | txt | jpg | JPG | jpeg | JPEG | png | PNG | gif | GIF file type are allowed!';
		return cb(new Error('Only pdf | doc | txt | jpg | JPG | jpeg | JPEG | png | PNG | gif | GIF file type  are allowed!'), false);
	}
	cb(null, true);
}

let uploadFiles = multer({
	storage : filestorage,
	allowedFiles
});



module.exports = router;
