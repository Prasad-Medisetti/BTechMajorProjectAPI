/* ------------------------------- Validation ------------------------------- */
const Joi = require("joi");

/* --------------------------- Sign Up Validation --------------------------- */
const signupValidation = (data) => {
	const schema = Joi.object({
		firstName: Joi.string().min(3).required(),
		lastName: Joi.string().min(3).required(),
		email: Joi.string().email().min(6).required(),
		password: Joi.string().min(6).required(),
		gender: Joi.string().valid("Male", "Female", "Others").required(),
		designation: Joi.string()
			.valid("Student", "Faculty", "Hod", "Principal")
			.required(),
	});

	return schema.validate(data);
};

/* --------------------------- Sign In Validation --------------------------- */
const signinValidation = (data) => {
	const schema = Joi.object({
		email: Joi.string().email().min(6).required(),
		password: Joi.string().min(6).required(),
		designation: Joi.string()
			.valid("Student", "Faculty", "Hod", "Principal")
			.required(),
	});

	return schema.validate(data);
};

module.exports.signupValidation = signupValidation;
module.exports.signinValidation = signinValidation;
