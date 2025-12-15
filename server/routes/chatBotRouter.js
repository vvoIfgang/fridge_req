const express = require("express");
const router = express.Router();
const chatBotController = require("../controller/chatBotController");
const { verifyToken } = require("../controller/authMiddleware");

router.post("/recipe", verifyToken, chatBotController.chatbot);

module.exports = router;
