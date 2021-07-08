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
	postedBy: {
		type: Object,
	},
	isPrivate: {
		type: Boolean,
    default: false,
		required: true,
	},
  access: {
		type: Object,
    student: {
      type: Boolean,
	    default: false
    },
    faculty: {
      type: Boolean,
	    default: false
    },
    hod: {
      type: Boolean,
	    default: false
    }
  },
	files: {
    type: Array
  },
  urlList: {
    type: Array
  },
	author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
	// category: {
	// 	type: String,
	// 	required: true,
	// },

}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);
