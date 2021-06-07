const express = require("express"),
	path = require("path");
(mongoose = require("mongoose")),
	(cors = require("cors")),
	(morgan = require("morgan"));
dotenv = require("dotenv");

dotenv.config();

/* ---------------------------- Import Database URL ---------------------------- */
const database = require("./database/db");

/* ---------------------------- Import Routes ---------------------------- */
const authRoute = require("./routes/Auth"),
	noteRoute = require("./routes/Note");

/* ---------------------------- Env Configs ---------------------------- */
require("dotenv").config();
mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);

/* ----------------------------  Connect to DB---------------------------- */
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

/* ------------------------------- Route Middlewares ------------------------------ */
const app = express();
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	}),
);
app.use(cors());
app.use(morgan("dev"));

/* -------------------- Use The Express Static Middleware ------------------- */
app.use(express.static("public"));
app.use("/static", express.static(path.join(__dirname, "public")));

/* ------------------------------- Routes ------------------------------ */
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/api", (req, res) => {
	res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.use("/api/notes", noteRoute);

app.use("/api/auth", authRoute);

/* -------------------------------- 404 route ------------------------------- */
app.use("*", (req, res) => {
	res.status(404).sendFile(path.join(__dirname, "./public/404.html"));
});

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
	console.log("Server Up and Running on PORT " + port);
});

// // Error Handling
// app.use((req, res, next) => {
// 	next(createError(404));
// });
