const maria = require("mariadb");
require("dotenv").config();

const pool = maria.createPool({
  host: process.env.Dbhost,
  user: process.env.DbUser,
  password: process.env.DbPw,
  database: DataBase,
});

module.exports = pool;
