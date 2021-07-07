const router = require("express").Router(),
	bcrypt = require("bcryptjs"),
	jwt = require("jsonwebtoken");

const { signupValidation, signinValidation } = require("../validation");
const User = require("../models/User");
const verify = require("./verifyToken");

const isValidUser = (user) => {
		let valid = false;

		switch (user.designation) {
			case "Student":
				if (
					user.branch &&
					user.rollNo &&
					user.section &&
					user.academicYear &&
					user.collegeName
				) {
					valid = true;
				} else {
					valid = false;
				}
				break;
			case "Faculty":
				if (user.empId && user.branch && user.collegeName) {
					valid = true;
				} else {
					valid = false;
				}
				break;
			case "Hod":
				if (user.empId && user.branch && user.collegeName) {
					valid = true;
				} else {
					valid = false;
				}
				break;
			case "Principal":
				if (user.empId && user.collegeName) {
					valid = true;
				} else {
					valid = false;
				}
				break;
		}

		return valid;
	};


router.post("/signup", async (req, res) => {
	console.log(JSON.stringify(req.body))

	/* -------------- Validate The Data Before The User Is Created -------------- */
	const { error } = signupValidation(req.body);

	if (error) return res.status(400).json({"error":error.details[0].message});

	/* ----------- Checking If The User Alreafy Exist In The Database ----------- */
	const emailExist = await User.findOne({ email: req.body.email });

	if (emailExist)
		return res.status(400).json({"error":"User with given email already exists"});

	/* ---------------------------- Hashing Password ---------------------------- */
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	const user = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: hashedPassword,
		gender: req.body.gender,
		designation: req.body.designation,
	});

	try {
		const savedUser = await user.save();
		const { password, ...userData } = savedUser.toJSON();
		res.send(userData);
	} catch (error) {
		res.status(400).send(err);
	}
});

router.post("/signin", async (req, res) => {
	const data = req.body;

	/* -------------- Validate The Data Before The User Is Signed In -------------- */
	const { error } = signinValidation(req.body);

	if (error) return res.status(400).json({"error":error.details[0].message});

	/* ----------- Checking If The Email Exists In The Database ----------- */
	const user = await User.findOne({ email: data.email });

	if (user === null) return res.status(404).json({"error":"User does not exist..."});
	if (data.designation !== user.designation) return res.status(401).json({"error":"Invalid User Account Type"});

	/* ----------- Comparing the password with hashed password ----------- */
	const validPass = await bcrypt.compare(data.password, user.password);

	if (!validPass) return res.status(401).json({"error":"Email or Password Incorrect..."});

	// Create and Assign a Token
	const token = await jwt.sign({ _id: user._id, role:user.designation }, process.env.TOKEN_SECRET, {
		expiresIn: '1d', // expires in 24 hours
	});

	let { password, ...userData } = user.toJSON();

	res.header("authorization", `Bearer ${token}`).json({"message":"success", token, user: userData });
});

router.get('/user', verify, async (req, res) => {
	const {user} = req;
	// console.log('note.js get user ',req.user)

	if (!user) {
		// return res.sendStatus(403);
		return
	}

	User.findById(user._id, function (err, docs) {
	    if (err){
	    	console.log(err)
	        return res.status(401).send(err);
	    }
	    else{
			console.log('verifyToken.js user ', docs);
			return res.send(docs);
	    }
	});
})

router.patch("/user/:id", verify, async (req, res) => {
	const {user} = req;
	const {id} = req.params;
	const data = req.body;

	if (!user) {
		// return res.sendStatus(403);
		return
	}
	if (isValidUser(data)===false) return res.status(400).json({"error":'All fields required'})

	console.log({...data})

	User.findByIdAndUpdate(id, { ...data }, {new: true}, (error, savedData) => {
		if (error) {
			console.log('find by id and update error ' ,error)
			res.send(404);
		} else {
			console.log(savedData);
			res.json(savedData);
		}
	});
});

module.exports = router;
