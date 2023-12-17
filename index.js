const express = require("express"),
	path = require("path"),
	mongoose = require("mongoose"),
	cors = require("cors"),
	morgan = require("morgan"),
	dotenv = require("dotenv").config(),
	multer = require("multer"),
	fs = require("fs");

const mailjet = require("node-mailjet").connect(
	process.env.MJ_APIKEY_PUBLIC,
	process.env.MJ_APIKEY_PRIVATE,
);

const Mailer = require("./utils/Mailer");
const emailHTMLTemplate = require("./utils/emailTemplate");
const uploadFiles = require("./routes/FileUpload");
const { getFiles } = require("./utils/file");

/* ------------------------------- Middlewares ------------------------------ */
const app = express();

app.use(cors({
	origin: '*',
	methods: '*',
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	}),
);

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
		useCreateIndex: true,
	})
	.then(
		() => {
			console.log("Database connected sucessfully !");
		},
		(error) => {
			console.log("Database could not be connected : " + error);
		},
	);

/* -------------------- Use The Express Static Middleware ------------------- */
app.use(express.static("public"));

// Setting up the express static directory
app.use("/static", express.static(path.join(__dirname, "./public")));
app.use("/api/uploads", express.static(path.join(__dirname, "./uploads")));

/* ------------------------------- Routes ------------------------------ */
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "./public/index.html"));
});
app.get("/api", (req, res) => {
	res.sendFile(path.join(__dirname, "./public/index.html"));
});
app.use("/api/notes", noteRoute);
app.use("/api/auth", authRoute);

app.get("/api/sendmail/:email", (req, res) => {
	const { email } = req.params;
	console.log(req.params);

	const request = mailjet
		.post("send", {'version': 'v3.1'})
		.request({
			"Messages":[
				{
					"From": {
						"Email": "admin@academicbulletinboard.web.app",
						"Name": "Test"
					},
					"To": [
						{
							"Email": email,
							"Name": "passenger 1"
						}
					],
					"TemplateID": 3040762,
					"TemplateLanguage": true,
					"Subject": "You have a new message!",
					"Variables": {
				      "name": "Prasad"
				    }
				}
			]
		})
	request
		.then((result) => {
			console.log(result.body)
			res.send(result.body);
		})
		.catch((err) => {
			console.log(err.statusCode)
			res.status(500).send({ message: `Unexpected error occurred!`, err });
		})
});

app.get("/api/uploads", (req, res) => {
	let files = getFiles();
	res.json(files);
});

app.post("/api/uploads", (req, res) => {
	uploadFiles(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			// A Multer error occurred when uploading.
			res.status(500).send({ message: `Unexpected error occurred!`, err });
			return;
		} else if (err) {
			// An unknown error occurred when uploading.
			if (err.name == "ExtensionError") {
				res.status(413).send({ message: err.message, err }).end();
			} else {
				res
					.status(500)
					.send({
						message: `unknown uploading error: ${err.message}`,err,
					})
					.end();
			}
			return;
		}

		// Everything went fine.
		// show file `req.files`
		// show body `req.body`
		res.json({
			message: "Successfully uploaded " + req.files.length + " files!",
			files: req.files,
		});
	});
});

app.delete("/api/uploads/:fileName", (req, res) => {
	// console.log(req.params);
	const DIR = "./uploads/files";
	const fileName = req.params.fileName;
	if (!fileName) {
		// console.log("No file received");
		return res
			.status(500)
			.send({
				message: `unknown deleting error: ${err.message}`,
			})
			.end();
	} else {
		// console.log("file received");
		// console.log(fileName);
		try {
			fs.unlinkSync(DIR + "/" + fileName);
			return res
				.status(200)
				.send({
					message: `Successfully! '${fileName}' has been Deleted`,
				})
				.end();
		} catch (err) {
			// handle the error
			return res
				.status(500)
				.send({
					message: err.message,
				})
				.end();
		}
	}
});

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


// Export the Express API
module.exports = app;
