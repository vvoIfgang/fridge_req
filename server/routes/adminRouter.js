// server/routes/adminRouter.js
const express = require("express");
const router = express.Router();
const adminControl = require("../controller/adminControl");
const { verifyToken, verifyAdmin } = require("../controller/authMiddleware");

// 모든 관리자 API는 로그인(verifyToken) + 관리자체크(verifyAdmin) 필수

// 1. 목록 조회
router.get("/users", verifyToken, verifyAdmin, adminControl.getAllUsers);

// 2. 상세 검색 (이름으로)
router.get("/users/detail", verifyToken, verifyAdmin, adminControl.getUserDetail);

// 3. 상태 변경 (정지/활성)
router.put("/users/status", verifyToken, verifyAdmin, adminControl.updateUserStatus);

// 4. 계정 삭제
router.delete("/users/:id", verifyToken, verifyAdmin, adminControl.deleteUser);

module.exports = router;