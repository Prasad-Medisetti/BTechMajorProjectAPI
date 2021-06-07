const mongoose = require("mongoose"),
	express = require("express"),
	router = express.Router();

const note = require("../models/Note");
const verify = require("./verifyToken");

router.get("/", verify, (req, res, next) => {
	note.find((error, data) => {
		if (error) {
			return next(error);
		} else {
			res.json(data);
		}
	});
});

router.post("/", verify, (req, res, next) => {
	note.create(req.body, (error, data) => {
		if (error) {
			return next(error);
		} else {
			console.log(data);
			res.json(data);
		}
	});
});

router.get("/:id", verify, (req, res, next) => {
	note.findById(req.params.id, (error, data) => {
		if (error) {
			return next(error);
		} else {
			res.json(data);
		}
	});
});

// Update Student
router.put("/:id", verify, (req, res, next) => {
	note.findByIdAndUpdate(req.params.id, { ...req.body }, (error, data) => {
		if (error) {
			console.log(error);
			res.send(404);
		} else {
			res.json(data);
			console.log("note updated successfully !");
		}
		return next(error);
	});
});

router.delete("/:id", verify, (req, res, next) => {
	note.findByIdAndRemove(req.params.id, (error, data) => {
		if (error) {
			return next(error);
		} else {
			res.status(200).json({
				msg: data,
			});
		}
	});
});

module.exports = router;
