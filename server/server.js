const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
require("dotenv").config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../my-app/build")));

const authRoute = require("./routes/authlogin");
const fridgeRoute = require("./routes/fridgeRouter");
const youtubeRoute = require("./routes/youtubeRouter");
const recipeRoute = require("./routes/recipesRouter");
const adminRouter = require("./routes/adminRouter");
const profileRouter = require("./routes/profileRouter");
const chatBotRoute = require("./routes/chatBotRouter");

app.use("/api/fridge", fridgeRoute);
app.use("/api/auth", authRoute); //api 요청 /api/auth/login, /api/auth/register
app.use("/api/youtube", youtubeRoute);
app.use("/api/recipes", recipeRoute);
app.use("/api/admin", adminRouter);
app.use("/api/mypage", profileRouter);
app.use("/api/chatbot", chatBotRoute);

app.listen(process.env.PORT, () => {
  console.log(`http://localhost:${process.env.PORT} 에서 서버 실행중`);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../my-app/build/index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../my-app/build/index.html"));
});
