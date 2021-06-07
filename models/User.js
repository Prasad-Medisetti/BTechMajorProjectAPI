const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	full_name: { type: String, required: true, min: 6, max: 255 },
	email: { type: String, required: true, min: 6, max: 255 },
	password: { type: String, required: true, min: 6, max: 1024 },
	date: { type: Date, default: Date.now },
});

userSchema.methods.toJSON = function () {
	var obj = this.toObject();
	delete obj.password;
	return obj;
};
module.exports = mongoose.model("User", userSchema);
