/* ------------------------------- Validation ------------------------------- */
const Joi = require("joi");

/* --------------------------- Sign Up Validation --------------------------- */
const signupValidation = (data) => {
	const schema = Joi.object({
		full_name: Joi.string().min(6).required(),
		email: Joi.string().email().min(6).required(),
		password: Joi.string().min(6).required(),
	});

	return schema.validate(data);
};

/* --------------------------- Sign In Validation --------------------------- */
const signinValidation = (data) => {
	const schema = Joi.object({
		email: Joi.string().email().min(6).required(),
		password: Joi.string().min(6).required(),
	});

	return schema.validate(data);
};

module.exports.signupValidation = signupValidation;
module.exports.signinValidation = signinValidation;
