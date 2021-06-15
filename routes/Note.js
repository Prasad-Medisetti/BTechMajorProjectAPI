const mongoose = require("mongoose"),
	express = require("express"),
	router = express.Router(),
	Joi= require("joi");

const note = require("../models/Note");
const verify = require("./verifyToken");

const schema = Joi.object({
		title: Joi.string().required(),
		details: Joi.string().required(),
		category: Joi.string()
			.valid("todo", "remainder")
			.required(),
	});

router.get("/", (req, res) => {	
	const {user} = req;
	// console.log('note.js get user ',user)
	
	if (!user) {
		return res.sendStatus(403);
	}

	note.find({},(error, data) => {
		if (error) {
			console.log('find error ' ,error)
			return next(error);
		} else {
			res.json(data);
		}
	});
});

router.get("/:id", verify, (req, res) => {
	const {user} = req;
	// console.log('note.js GETbyId user ',user)
	
	if (!user) {
		return res.sendStatus(403);
	}

	note.findById(req.params.id, (error, data) => {
		if (error) {
			return next(error);
		} else {
			res.json(data);
		}
	});
});

router.post("/", verify, (req, res) => {
	const {user} = req;
	const data = req.body;
	// console.log('note.js post user ',user)
	
	if (!user) {
		return res.sendStatus(403);
	}
	
	/* -------------- Validate The Data -------------- */
	const { error } = schema.validate(data);

	if (error) return res.status(400).json({"error":error.details[0].message});
	
	note.create(data, (error, data) => {
		if (error) {
			console.log(error);
		} else {
			console.log(data);
			res.json(data);
		}
	});
});

// Update note
router.patch("/:id", verify, (req, res) => {
	const {user} = req;
	const {id} = req.params;
	const data = req.body;
	// console.log('note.js PUTById user ',user)
	
	if (!user) {
		return res.sendStatus(403);
	}

	/* -------------- Validate The Data -------------- */
	const { error } = schema.validate(data);

	if (error) return res.status(400).json({"error":error.details[0].message});

	note.findByIdAndUpdate(id, { ...data },{new: true}, (error, savedData) => {
		if (error) {
			console.log(error);
			res.send(404);
		} else {
			console.log(savedData);
			res.json(savedData);
		}
	});
});

router.delete("/:id", verify, (req, res) => {
	const {user} = req;
	// console.log('note.js DELETEById user ',user)
	
	if (!user) {
		return res.sendStatus(403);
	}
	
	note.findByIdAndRemove(req.params.id, (error, deletedData) => {
		if (error) {
			return next(error);
		} else {
			console.log("Removed User : ", deletedData);
			res.status(200).json(deletedData);
		}
	});
});

module.exports = router;
