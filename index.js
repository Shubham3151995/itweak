const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const corsOptions = require("./config/corsOptions");
const credentials = require("./middlewares/credentials");
const verifyJWT = require("./middlewares/verifyJWT");
const swaggerDocs = require("./utils/swagger");
// Import database connection config
const connectDB = require("./config/db");
// Connect to MongoDB
connectDB();

const app = express();
const { port } = require("./config/appConfig");

// swaggerDocs(app, port);
// Handle options credentials check - before CORS!
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Built-in middleware to handle urlencoded form data
// app.use(express.urlencoded({ extended: false }));

// Built-in middleware for json
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());
// uploading files
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(function (req, res, next) {
  global.baseUrl = req.protocol + "://" + req.headers.host;
  return next();
});

// Add new user and authentication
app.use("/", require("./routes/auth"));
app.use("/public", express.static(__dirname + "/public"));
// JWT authentication middleware
app.use(verifyJWT);
app.use("/user", require("./routes/user"));
app.use("/payment", require("./routes/transaction"));
app.use("/subscription", require("./routes/subscription"));

app.all("*", (req, res) => {
  res.status(404).send({
    error: true,
    code: 404,
    msg: "Api Not Found",
  });
});
app.listen(port, () => {console.log(`App listening on port ${port}`);
});


