const router = require("express").Router(),
	bcrypt = require("bcryptjs");
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
	const hashPassword = await bcrypt.hash(req.body.password, salt);

	const user = new User({
		full_name: req.body.full_name,
		email: req.body.email,
		password: hashPassword,
	});

	try {
		const savedUser = await user.save();
		res.send(savedUser.toJSON());
	} catch (error) {
		res.status(400).send(err);
	}
});

router.post("/signin", async (req, res) => {
	/* -------------- Validate The Data Before The User Is Signed In -------------- */
	const { error } = signupValidation(req.body);

	if (error) return res.status(400).send(error.details[0].message);
});

module.exports = router;
