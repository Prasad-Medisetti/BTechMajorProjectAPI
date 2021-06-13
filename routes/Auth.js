const router = require("express").Router(),
	bcrypt = require("bcryptjs"),
	jwt = require("jsonwebtoken");
const { signupValidation, signinValidation } = require("../validation");
const User = require("../models/User");

router.post("/signup", async (req, res) => {
	/* -------------- Validate The Data Before The User Is Created -------------- */
	const { error } = signupValidation(req.body);

	if (error) return res.status(400).send(error.details[0].message);

	/* ----------- Checking If The User Alreafy Exist In The Database ----------- */
	const emailExist = await User.findOne({ email: req.body.email });

	if (emailExist)
		return res.status(400).send("User with given email already exists");

	/* ---------------------------- Hashing Password ---------------------------- */
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	const user = new User({
		full_name: req.body.full_name,
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
	/* -------------- Validate The Data Before The User Is Signed In -------------- */
	const { error } = signinValidation(req.body);

	if (error) return res.status(400).send(error.details[0].message);

	/* ----------- Checking If The Email Exists In The Database ----------- */
	const user = await User.findOne({ email: req.body.email });

	if (!user) return res.status(404).send("User does not exist...");

	/* ----------- Checking If The Email Exists In The Database ----------- */
	const validPass = await bcrypt.compare(req.body.password, user.password);

	if (!validPass) return res.status(401).send("Email or Password Incorrect...");

	// Create and Assign a Token
	const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
		expiresIn: "1d", // expires in 24 hours
	});

	let { _id, __v, password, ...userData } = user.toJSON();
	res.header("authorization", `Bearer ${token}`).json({ token, ...userData });
});

module.exports = router;
