const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) return res.status(401).send("Access Denied...");

	try {
		const verified = jwt.verify(token, process.env.TOKEN_SECRET);
		req.user = verified;
		console.log(`verified`, authHeader);
		next();
	} catch (error) {
		res.status(401).send("Invalid Token");
	}
};

module.exports = auth;
