const multer = require("multer");

const filesPath = "uploads/files";

let fileStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, filesPath);
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "__" + file.originalname);
	},
});

let allowedFiles = function (req, file, cb) {
	// Accept images only
	if (
		!file.originalname.match(
			/\.(pdf|doc|txt|jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/,
		)
	) {
		req.fileValidationError =
			"Only pdf | doc | txt | jpg | JPG | jpeg | JPEG | png | PNG | gif | GIF file type are allowed!";
		return cb(
			new Error(
				"Only pdf | doc | txt | jpg | JPG | jpeg | JPEG | png | PNG | gif | GIF file type  are allowed!",
			),
			false,
		);
	}
	cb(null, true);
};

let uploadFiles = multer({
	storage: fileStorage,
	limits: {
		fileSize: 1024 * 1024 * 5,
	},
	fileFilter: allowedFiles,
}).any("files");

module.exports = uploadFiles;
