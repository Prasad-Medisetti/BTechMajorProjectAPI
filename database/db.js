require("dotenv").config();

module.exports = {
	db: process.env.MONGO_DB_URI,
	// db: "mongodb://localhost:27017/notesapp",
};
