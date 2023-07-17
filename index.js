const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
// const cron = require("node-cron");
// const cronJobFunc = require("./services/CronJob");
const corsOptions = require("./config/corsOptions");
const credentials = require("./middlewares/credentials");
const verifyJWT = require("./middlewares/verifyJWT");
const swaggerDocs = require("./utils/swagger");
const NodeGeocoder = require("node-geocoder");
const saveDefaultPreffrence = require("./services/SavePreffrence");
// Import database connection config
const connectDB = require("./config/db");
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
// Connect to MongoDB
connectDB();

const app = express();
const { port } = require("./config/appConfig");
// cron.schedule("0 0 0 * * *", () => {
//   cronJobFunc();
//   console.log("running every minute 1, 2, 4 and 5");
// });
//calling the swagger function to create ui and docs path in the server
swaggerDocs(app, port);
// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
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

// async function  latLong(){
//   const options = {
//     provider: 'google',

//     // Optional depending on the providers
//     // fetch: customFetchImplementation,
//     apiKey: GOOGLE_MAPS_API_KEY, // for Mapquest, OpenCage, Google Premier
//     formatter: null // 'gpx', 'string', ...
//   };

//   const geocoder = NodeGeocoder(options);

//   // Using callback
//   const res = await geocoder.geocode('29 champs elysée paris');

//   console.log("@@@@@",res)
// };
// latLong();

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
app.use("/admin", require("./routes/admin"));
app.use("/api", require("./routes/preferences"));
app.use("/hero", require("./routes/hero"));
app.use("/order", require("./routes/order"));
app.use("/payment", require("./routes/transaction"));
app.use("/rating", require("./routes/rating"));
app.use("/business", require("./routes/business"));
app.use("/promocode", require("./routes/promocode"));
app.use("/pricegroup", require("./routes/pricegroup"));
app.use("/subscription", require("./routes/subscription"));
app.use("/template", require("./routes/template"));
app.use("/referral", require("./routes/referral"));
app.use("/product", require("./routes/products"));

app.all("*", (req, res) => {
  res.status(404).send({
    error: true,
    code: 404,
    msg: "Api Not Found",
  });
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
// Run server on port after getting db connection
mongoose.connection.once("open", async () => {
  try {
    console.log("Connected to MongoDB");
    await saveDefaultPreffrence();
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
});

// cloudinary Configuration
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
