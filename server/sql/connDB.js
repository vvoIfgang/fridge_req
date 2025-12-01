const maria = require("mariadb");
require("dotenv").config();

const pool = maria.createPool({
  host: process.env.DbHost,
  user: process.env.DbUser,
  password: process.env.DbPw,
  database: process.env.DataBase,
  port: process.env.DbPort,
  allowPublicKeyRetrieval: true,
});

module.exports = pool;
