// server/routes/profileRouter.js
const express = require("express");
const router = express.Router();
const profileControl = require("../controller/profileControl");
const { verifyToken } = require("../controller/authMiddleware");

// GET /api/mypage/profile/:userId
router.get("/profile/:userId", verifyToken, profileControl.getProfile);

// PUT /api/mypage/profile/:userId
router.put("/profile/:userId", verifyToken, profileControl.updateProfile);

module.exports = router;