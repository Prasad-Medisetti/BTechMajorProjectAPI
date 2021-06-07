const express = require("express"),
	mongoose = require("mongoose"),
	cors = require("cors"),
	morgan = require("morgan");
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

/* ------------------------------- Routes ------------------------------ */
app.get("/", (req, res) => {
	res.send(
		`<h1>RESET API server for <code>ACADEMIC BULLETIN BOARD PROJECT</code></h1>`,
	);
});

app.get("/api", (req, res) => {
	res.send(
		`<h1>RESET API server for <code>ACADEMIC BULLETIN BOARD PROJECT</code></h1>
		<h3>end points</h3>
		<ul>
			<li><a href="">/api/notes</a></li>
			<li><a href="">/api/auth/signup</a></li>
			<li><a href="">/api/auth/signin</a></li>
		</ul>`,
	);
});

app.use("/api/notes", noteRoute);

app.use("/api/auth", authRoute);

/* -------------------------------- 404 route ------------------------------- */
app.use("*", (req, res) => {
	res.status(404).json({ error: "Not Found" });
});

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
	console.log("Server Up and Running on PORT " + port);
});

// // Error Handling
// app.use((req, res, next) => {
// 	next(createError(404));
// });
