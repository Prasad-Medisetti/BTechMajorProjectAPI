const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	full_name: { type: String, required: true, min: 6, max: 255 },
	email: { type: String, unique: true, required: true, min: 6, max: 255 },
	gender: { type: String, enum: ["Male", "Female", "Others"], required: true },
	password: { type: String, required: true, min: 6, max: 1024 },
	designation: {
		type: String,
		enum: ["Student", "Faculty", "Hod", "Principal"],
		required: true,
	},
	date: { type: Date, default: Date.now },
});

userSchema.methods.toJSON = function () {
	var obj = this.toObject();
	delete obj.password;
	return obj;
};
module.exports = mongoose.model("User", userSchema);
