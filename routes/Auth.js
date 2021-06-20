const router = require("express").Router(),
	bcrypt = require("bcryptjs"),
	jwt = require("jsonwebtoken");
const { signupValidation, signinValidation } = require("../validation");
const User = require("../models/User");

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
		expiresIn: "1d", // expires in 24 hours
	});

	let { password, ...userData } = user.toJSON();

	res.header("authorization", `Bearer ${token}`).json({"message":"success", token, user: userData });
});

router.get('/user', async (req, res) => {
	console.log('verify auth.js');

	const authHeader = req.headers.authorization;
	if (authHeader) {
		const token = authHeader && authHeader.split(' ')[1];

		if (token == null) return res.sendStatus(401)

		jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
			if (err) {
				// console.log('err', err.message);
				return res.sendStatus(401).send(err);
			}

			User.findById(data._id, function (err, docs) {
			    if (err){
			        return res.sendStatus(401).send(err);
			    }
			    else{
					console.log('verifyToken.js user ', docs);
					res.send(docs);
			    }
			});
		});
	} else {
		res.sendStatus(401);
	}
})

module.exports = router;
