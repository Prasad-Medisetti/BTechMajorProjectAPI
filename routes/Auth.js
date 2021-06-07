const router = require("express").Router();
const { signupValidation } = require("../validation");

/* ------------------------------ Import Model ------------------------------ */
const User = require("../models/User");

router.post("/signup", async (req, res) => {
	/* -------------- Validate The Data Before The User Is Created -------------- */
	const { error } = signupValidation(req.body);

	if (error) return res.status(400).send(error.details[0].message);

	/* ----------- Checking If The User Alreafy Exist In The Database ----------- */
	const emailExist = await User.findOne({ email: req.body.email });

	if (emailExist) return res.status(400).send("Email already exists");

	const user = new User({
		full_name: req.body.full_name,
		email: req.body.email,
		password: req.body.password,
	});

	try {
		const savedUser = await user.save();
		res.send(savedUser);
	} catch (error) {
		res.status(400).send(err);
	}
});

module.exports = router;
