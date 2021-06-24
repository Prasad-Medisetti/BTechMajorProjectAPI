const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (authHeader) {
		const token = authHeader && authHeader.split(' ')[1];

		if (token == null) return res.sendStatus(401)

		jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
			if (err) {
				console.log('err', err.message);
				return res.sendStatus(403).send(err.message);
			}

			req.user = user;
			// console.log('verifyToken.js req ',req.user)
		});
	} else {
		res.sendStatus(401);
	}

	next();
};

module.exports = authenticateToken;
