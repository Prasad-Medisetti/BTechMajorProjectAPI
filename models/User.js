const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
		min: 3,
		max: 255
	},
	lastName: {
		type: String,
		required: true,
		min: 3,
		max: 255
	},
	email: {
		type: String,
		unique: true,
		required: true,
		min: 6,
		max: 255
	},
	gender: {
		type: String,
		enum: ["Male", "Female", "Others"],
		required: true
	},
	password: {
		type: String,
		required: true,
		min: 6,
		max: 1024
	},
	designation: {
		type: String,
		enum: ["Student", "Faculty", "Hod", "Principal"],
		required: true,
	},
	role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "superadmin"]
  },
	posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
	branch: {	type: String },
	rollNo: {	type: String },
	section: {	type: String },
	academicYear: {	type: String },
	collegeName: {	type: String },
	empId: {	type: String },
}, { timestamps: true });

userSchema.methods.toJSON = function () {
	var obj = this.toObject();
	delete obj.password;
	return obj;
};

module.exports = mongoose.model("User", userSchema);
