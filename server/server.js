const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("../my-app/public"));

const authRoute = require("./routes/authlogin");
app.use("/api/auth", authRoute); //api 요청 /api/auth/login, /api/auth/register

app.listen(process.env.PORT, () => {
  console.log(`http://localhost:${process.env.PORT} 에서 서버 실행중`);
});

app.get("*", (req, res) => {
  res.sendFile("../my-app/public/index.html");
});
