const express = require("express"),
	router = express.Router(),
	Joi = require("joi"),
	fs = require("fs"),
	mailjet = require("node-mailjet").connect(
		process.env.MJ_APIKEY_PUBLIC,
		process.env.MJ_APIKEY_PRIVATE,
	);


const note = require("../models/Note");
const verify = require("./verifyToken");
const User = require("../models/User");

const titleCase = (str) => {
	return str
		.toLowerCase()
		.split(" ")
		.map(function (word) {
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
};

const schema = Joi.object({
	title: Joi.string().required(),
	details: Joi.string().required(),
	isPrivate: Joi.boolean().required(), // .valid("todos", "remainders","work","money")
	access: Joi.object().required(),
	sendEmailAlerts: Joi.boolean().required(),
	postedBy: Joi.object(),
	files: Joi.array(),
	urlList: Joi.array(),
});

router.get("/", verify, (req, res) => {
	const { user } = req;
	// console.log("note.js get user ", req.user);

	if (!user) {
		// return res.sendStatus(403);
		return;
	}

	note.find({}, null, { sort: { updatedAt: -1 } }, (error, data) => {
		if (error) {
			console.log("find all error ", error);
			res.status(500).send({ message: `Unexpected error occurred!`, error });
		} else {
			let newData = data.filter((note) => {
				if (
					note.isPrivate === false ||
					(note.isPrivate === true &&
						note.access.student &&
						note.access.hod &&
						note.faculty)
				)
					return note;
				else if (
					user.designation === "Student" &&
					note.isPrivate &&
					note.access.student === true
				)
					return note;
				else if (
					user.designation === "Faculty" &&
					note.isPrivate &&
					note.access.faculty === true
				)
					return note;
				else if (
					user.designation === "Hod" &&
					note.isPrivate &&
					note.access.hod === true
				)
					return note;
				else if (user._id === note.postedBy._id) return note;
				else return;
			});
			res.json(newData);
		}
	});
});

router.get("/:id", verify, (req, res) => {
	const { user } = req;
	// console.log('note.js GETbyId user ',user)

	if (!user) {
		// return res.sendStatus(403);
		return;
	}

	note.findById(req.params.id, (error, data) => {
		if (error) {
			console.log("find by id error ", error);
			res.status(500).send({ message: `Unexpected error occurred!`, error });
		} else {
			if (data == null) return res.sendStatus(404);
			res.json(data);
		}
	});
});

router.post("/", verify, async (req, res) => {
	const { user } = req;
	const data = req.body;
	// console.log("note.js post user ", data);

	if (!user) {
		// return res.sendStatus(403);
		return;
	}

	const userInfo = await User.findById(user._id);

	/* -------------- Validate The Data -------------- */
	const { error } = schema.validate(data);

	if (error) return res.status(400).json({ error: error.details[0].message });
	console.log(req.body, req.files);

	note.create(data, (error, data) => {
		if (error) {
			console.log("create new error ", error);
			res.status(500).send({ message: `Unexpected error occurred!`, error });
		} else {
			// console.log(data);

			if (data.sendEmailAlerts) {
				User.find({}, null, (err, docs) => {
					if (err) {
						return res.status(401).send(err);
					} else {
						const newDocs = docs.filter((item) =>  {
							if (user._id !== item._id && ( item.designation==='Student' 
									// || item.designation ==='Faculty'
								)) {
								item["Email"]=item["email"]
								item["Name"]= `${item["firstName"]} ${item["lastName"]}`;
								return item
							}
							else return;
						})

						let userName = `${userInfo.firstName} ${userInfo.lastName}`
						const request = mailjet
							.post("send", {'version': 'v3.1'})
							.request({
								"Messages":[
									{
										"From": {
											"Email": "academicbulletinboard@gmail.com",
											"Name": "Admin"
										},
										"To": newDocs,
										"TemplateID": 3040762,
										"TemplateLanguage": true,
										"Subject": "You have a new message!",
										"Variables": {
									      "name": titleCase(userName)
									    }
									}
								]
							})

						request
							.then((result) => {
								console.log(JSON.stringify(result.body))
							})
							.catch((err) => {
								console.log(err)
							})
					}
				});
			}
			res.json(data);
		}
	});
});

// Update note
router.patch("/:id", verify, async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	// console.log('note.js PUTById user ',user)
	const data = req.body;
	console.log(user._id, data.postedBy._id);

	if (!user) {
		// return res.sendStatus(403);
		return;
	}

	const userInfo = await User.findById(user._id);

	if (user._id !== data.postedBy._id)
		return res
			.status(403)
			.json({ error: "You cannot change other users post..." });

	/* -------------- Validate The Data -------------- */
	const { error } = schema.validate(data);

	if (error) return res.status(400).json({ error: error.details[0].message });

	note.findByIdAndUpdate(id, { ...data }, { new: true }, (error, savedData) => {
		if (error) {
			console.log("find by id and update error ", error);
			res.status(500).send({ message: `Unexpected error occurred!`, error });
		} else {
			console.log(savedData);
			if (data.sendEmailAlerts) {
				User.find({}, null, (err, docs) => {
					if (err) {
						return res.status(401).send(err);
					} else {
						const newDocs = docs.filter((item) =>  {
							if (user._id !== item._id && ( item.designation==='Student' 
									// || item.designation ==='Faculty'
								)) {
								item["Email"]=item["email"]
								item["Name"]= `${item["firstName"]} ${item["lastName"]}`;
								return item
							}
							else return;
						})

						let userName = `${userInfo.firstName} ${userInfo.lastName}`
						const request = mailjet
							.post("send", {'version': 'v3.1'})
							.request({
								"Messages":[
									{
										"From": {
											"Email": "academicbulletinboard@gmail.com",
											"Name": "Admin"
										},
										"To": newDocs,
										"TemplateID": 3040762,
										"TemplateLanguage": true,
										"Subject": "You have an updated message!",
										"Variables": {
									      "name": titleCase(userName)
									    }
									}
								]
							})

						request
							.then((result) => {
								console.log(JSON.stringify(result.body))
							})
							.catch((err) => {
								console.log(err)
							})
					}
				});
			}
			res.json(savedData);
		}
	});
});

router.delete("/:id", verify, (req, res) => {
	const { user } = req;
	// console.log('note.js DELETEById user ',user)

	if (!user) {
		// return res.sendStatus(403);
		return;
	}

	note.findByIdAndRemove(req.params.id, (error, deletedData) => {
		if (error) {
			console.log("find by id and remove error ", error);
			res.status(500).send({ message: `Unexpected error occurred!`, error });
		} else {
			console.log("Removed Note : ", deletedData);
			// deletedData.files.map((file) => {
			// 	const DIR = "../uploads/files";
			// 	fs.unlinkSync(DIR + "/" + file.filename);
			// })
			res.status(200).json(deletedData);
		}
	});
});

module.exports = router;
