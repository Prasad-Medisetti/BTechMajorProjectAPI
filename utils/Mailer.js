const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "academicbulletinboard@gmail.com",
		pass: "Project@123",
	},
});
