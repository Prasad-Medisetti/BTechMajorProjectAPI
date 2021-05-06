let express = require("express");
let mongoose = require("mongoose");
let cors = require("cors");
let morgan = require("morgan");

let database = require("./database/db");

const noteRoute = require("../server/routes/note.routes");

require("dotenv").config();
mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);

mongoose
	.connect(database.db, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(
		() => {
			console.log("Database connected sucessfully !");
		},
		(error) => {
			console.log("Database could not be connected : " + error);
		},
	);

const app = express();
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	}),
);
app.use(cors());
app.use(morgan("dev"));
app.use("/notes", noteRoute);
app.use("*", (req, res) => {
	res.status(404).json({ error: "Not Found" });
});

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
	console.log("Connected to port " + port);
});

// // Error Handling
// app.use((req, res, next) => {
// 	next(createError(404));
// });
