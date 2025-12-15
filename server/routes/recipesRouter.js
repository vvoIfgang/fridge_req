const express = require("express");
const router = express.Router();
const recipeController = require("../controller/recipeController");
const { verifyToken } = require("../controller/authMiddleware");

// 전체 레시피 목록 (MyRecipes.js)
router.get("/list", verifyToken, recipeController.getAllRecipes);

// 선호 레시피 추가 (MyRecipes.js)
router.post("/add-favorite", verifyToken, recipeController.addFavorite);

// 선호 레시피 목록 (Preferrecipes.js)
router.get("/favorites", verifyToken, recipeController.getFavorites);

// 선호 레시피 삭제 (Preferrecipes.js)
router.delete("/favorites/:id", verifyToken, recipeController.deleteFavorite);

module.exports = router;