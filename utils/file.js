const fs = require("fs"),
	path = require("path"),
	mime = require("mime");

const deleteFile = (filePath) => {
	fs.unlink(filePath, (err) => {
		if (err) {
			return err;
		}
	});
};

// Function to get current filenames
// in directory with specific extension
const getFiles = (dir = "uploads", filelist = []) => {
	fs.readdirSync(dir).forEach((file) => {
		filelist = fs.statSync(path.join(dir, file)).isDirectory()
			? getFiles(path.join(dir, file), filelist)
			: filelist.concat({
					name: file,
					path: path.join(dir, file),
					size: fs.statSync(path.join(dir, file)).size,
					type: mime.getType(file),
			  });
	});
	return filelist;
};

module.exports = { deleteFile, getFiles };
