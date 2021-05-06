let mongoose = require("mongoose"),
	express = require("express"),
	router = express.Router();

let note = require("../models/note-schema");

router.route("/").get((req, res) => {
	note.find((error, data, next) => {
		if (error) {
			return next(error);
		} else {
			res.json(data);
		}
	});
});

router.route("/").post((req, res, next) => {
	note.create(req.body, (error, data) => {
		if (error) {
			return next(error);
		} else {
			console.log(data);
			res.json(data);
		}
	});
});

router.route("/:id").get((req, res, next) => {
	note.findById(req.params.id, (error, data) => {
		if (error) {
			return next(error);
		} else {
			res.json(data);
		}
	});
});

// Update Student
router.route("/:id").put((req, res, next) => {
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

router.route("/:id").delete((req, res, next) => {
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
