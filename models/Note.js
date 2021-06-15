const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteSchema = new Schema(
	{
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
			required: [true, 'Why no bacon?'],
			enum: ["todo", "remainder"],
		},
		date: { type: Date, default: Date.now },
	},
);

module.exports = mongoose.model("Note", noteSchema);
