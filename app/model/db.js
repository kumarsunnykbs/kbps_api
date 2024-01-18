const mySql = require("mysql");

module.exports = mySql.createPool({
  multipleStatements: true,
  host: "localhost", //process.env.DB_HOST,
  user: "root", //process.env.DB_USER,
  password: "f@@@$$", //process.env.DB_PASSWORD,
  database: "", //process.env.DB_NAME
});
