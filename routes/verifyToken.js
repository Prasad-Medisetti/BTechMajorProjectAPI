const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers.authorization;
	
	if (authHeader) {
		const token = authHeader && authHeader.split(' ')[1];

		if (token == null) return res.sendStatus(401)

		jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
			if (err) {
				// console.log('err', err.message);
				return res.sendStatus(403).send(err.message);
			}

			// console.log('verifyToken.js user ',user)
			req.user = user;
			next();
		});
	} else {
		res.sendStatus(401);
	}
};

module.exports = authenticateToken;
