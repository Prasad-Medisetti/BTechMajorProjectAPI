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

app.use(cors());
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

	const request = mailjet.post("send").request({
		FromEmail: "academicbulletinboard@gmail.com",
		FromName: "Academic Bulletin Board",
		Subject: "Your email flight plan!",
		"Text-part":
			"Dear passenger, welcome to Mailjet! May the delivery force be with you!",
		"Html-part":
			'<h3>Dear passenger, welcome to <a href="https://www.mailjet.com/">Mailjet</a>!<br />May the delivery force be with you!',
		Recipients: [{ Email: email }],
	});
	request
		.then((result) => {
			console.log(result.body);
		})
		.catch((err) => {
			console.log(err.statusCode);
		});

	// var mailOptions = {
	// 	from: "Academic Bulletin Board",
	// 	to: email,
	// 	subject: "Sending Email using Node.js",
	// 	html: emailHTMLTemplate("User Name Here"), // html body
	// 	// forceEmbeddedImages: true,
	// 	attachments: [
	// 		{
	// 			// use URL as an attachment
	// 			cid: "newMessageImage",
	// 			// filename: "new_message.svg",
	// 			path: "https://raw.githubusercontent.com/Prasad-Medisetti/BTechMajorProject/build/src/assets/images/undraw_new_message_2gfk.png",
	// 			// path: "https://raw.githubusercontent.com/Prasad-Medisetti/BTechMajorProject/build/public/logo512.png",
	// 		},
	// 		{
	// 			// use URL as an attachment
	// 			cid: "user_icon",
	// 			// filename: "user.svg",
	// 			path: "https://firebasestorage.googleapis.com/v0/b/academic-bulletin-board.appspot.com/o/assets%2F1287507_user_account_avatar_human_people_icon.png?alt=media&token=bb212c9b-437e-4cff-91e3-4d1c5db95401",
	// 			// path: "https://assets.dryicons.com/uploads/icon/svg/5611/31e5c56c-2db5-4083-95be-9fbbea0eb2c2.svg",
	// 		},
	// 	],
	// };

	// Mailer.sendMail(mailOptions, (err, info) => {
	// 	if (err) {
	// 		console.log(err);
	// 		res.send(err);
	// 	} else {
	// 		console.log(info);
	// 		res.send(info);
	// 	}
	// });
});

app.get("/api/uploads", (req, res) => {
	let files = getFiles();
	res.json(files);
});

app.post("/api/uploads", (req, res) => {
	uploadFiles(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			// A Multer error occurred when uploading.
			res
				.status(500)
				.send({ message: `${err.message}` })
				.end();
			return;
		} else if (err) {
			// An unknown error occurred when uploading.
			if (err.name == "ExtensionError") {
				res.status(413).send({ message: err.message }).end();
			} else {
				res
					.status(500)
					.send({
						message: `unknown uploading error: ${err.message}`,
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
