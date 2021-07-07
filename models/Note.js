const mongoose = require("mongoose");
const path = require("path");

const noteSchema = new mongoose.Schema({
	title: {
	type: String,
		required: true,
	},
	details: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
	date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);
