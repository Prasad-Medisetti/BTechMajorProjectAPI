const mongoose = require("mongoose"),
	express = require("express"),
	router = express.Router(),
	Joi= require("joi");

const note = require("../models/Note");
const verify = require("./verifyToken");

const schema = Joi.object({
		title: Joi.string().required(),
		details: Joi.string().required(),
		category: Joi.string().required(), // .valid("todos", "remainders","work","money")
	});

router.get("/",verify, (req, res) => {
	const {user} = req;
	// console.log('note.js get user ',req.user)

	if (!user) {
		// return res.sendStatus(403);
		return
	}

	note.find({}, null, {sort: {updatedAt: -1}},(error, data) => {
		if (error) {
			console.log('find all error ' ,error)
			res.send(404);
		} else {
			res.json(data);
		}
	});
});

router.get("/:id", verify, (req, res) => {
	const {user} = req;
	// console.log('note.js GETbyId user ',user)

	if (!user) {
		// return res.sendStatus(403);
		return
	}

	note.findById(req.params.id, (error, data) => {
		if (error) {
			console.log('find by id error ' ,error)
			res.sendStatus(404);
		} else {
			if (data==null) return res.sendStatus(404);
			res.json(data);
		}
	});
});

router.post("/", verify, (req, res) => {
	const {user} = req;
	const data = req.body;
	console.log('note.js post user ',data)

	if (!user) {
		// return res.sendStatus(403);
		return
	}

	/* -------------- Validate The Data -------------- */
	const { error } = schema.validate(data);

	if (error) return res.status(400).json({"error":error.details[0].message});

	note.create(data, (error, data) => {
		if (error) {
			console.log('create new error ' ,error)
			res.send(400);
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
	// console.log('note.js PUTById user ',user)
	const data = req.body;
	console.log(req.body)

	if (!user) {
		// return res.sendStatus(403);
		return
	}

	/* -------------- Validate The Data -------------- */
	const { error } = schema.validate(data);

	if (error) return res.status(400).json({"error":error.details[0].message});

	note.findByIdAndUpdate(id, { ...data }, {new: true}, (error, savedData) => {
		if (error) {
			console.log('find by id and update error ' ,error)
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
		// return res.sendStatus(403);
		return
	}

	note.findByIdAndRemove(req.params.id, (error, deletedData) => {
		if (error) {
			console.log('find by id and remove error ' ,error)
			res.send(404);
		} else {
			console.log("Removed Note : ", deletedData);
			res.status(200).json(deletedData);
		}
	});
});

module.exports = router;
