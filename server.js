const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const routes = require("./app/routes/routes");
const upload = require("express-fileupload");
const cors = require("cors");

const app = express();
app.use(upload());

const port = process.env.PORT || 3024;

const whitelist = [
  "capacitor://localhost",
  "http://localhost",
  "http://localhost:4200",
  "http://localhost:3050",
  "https://kuberaprotocol.io",
  "https://app.kuberaprotocol.io/",
  "http://kuberaprotocol.io/admin/",
];
const corsOptions = {
  origin: "*",
};

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to the kuber");
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Authorization,authorization"
  );

  // console.log(req);

  next();
});

app.use("/", routes);

//routes.use(app, cors(corsOptions));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
var request = require("request");
var cron = require("node-cron");
cron.schedule("00 00 * * *", () => {
  cron.schedule("00 00 * * *", () => {
    console.log(new Date().getTime());
    request.get(
      {
        headers: {
          Origin: "http://localhost:4200",
        },
        url: "http://-----/giveDailyBonus",
      },
      function (error, response, body) {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//", body);
        console.log("Running a task everyday 12:00 Minutes");
      }
    );
  });
});
