const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let noteSchema = new Schema(
	{
		title: {
			type: String,
		},
		details: {
			type: String,
		},
		category: {
			type: String,
		},
	},
	{
		collection: "notes",
	}
);

module.exports = mongoose.model("Note", noteSchema);
