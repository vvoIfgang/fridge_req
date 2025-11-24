const express = require("express");
const app = express();
const maria = require("mariadb");
require("dotenv").config();

const pool = maria.createPool({
  host: process.env.Dbhost,
  user: process.env.DbUser,
  password: process.env.DbPw,
  database: DataBase,
});

app.listen(process.env.PORT, () => {
  console.log(`http://localhost:${process.env.PORT} 에서 서버 실행중`);
});

app.get("/", (req, res) => {
  res.send("반갑다");
});
