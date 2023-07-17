require("dotenv").config();
var express = require("express");
var cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var indexRouter = require("./routes/index");
// var swaggermerge = require("swagger-merge");

var app = express();
const connectDB = require("./config/connection"); //importing db connection module.....
connectDB();
const userRoutes = require("./modules/user/user.routes");
const PORT = process.env.PORT || 5000;

//using swagger.json file
//const userSwagger = require("./modules/user/user.swagger.json");

// var info = {
//   version: "0.0.1",
//   title: "video straming",
//   description: "Video straming apis",
// };
// merged = swaggermerge.merge(
//   [
//     userSwagger
//   ],

//   info,
//   "/api",
//   process.env.DOMAIN + ":" + process.env.APP_PORT,

// );

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", indexRouter);
app.use("/api", userRoutes);
app.listen(PORT, console.log("Server started on port 5000"));
