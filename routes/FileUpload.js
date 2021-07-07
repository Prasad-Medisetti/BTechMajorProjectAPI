const mongoose = require("mongoose"),
	express = require("express"),
	router = express.Router(),
  multer = require("multer"),
  path = require("path");

  const filesPath = path.join("./public/uploads/files");

const note = require("../models/Note");



module.exports = router;
