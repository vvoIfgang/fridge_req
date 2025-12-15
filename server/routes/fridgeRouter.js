const express = require("express");
const router = require("express").Router();
const fridgeController = require("../controller/refrigerator");
const { verifyToken } = require("../controller/authMiddleware");

router.get("/", verifyToken, fridgeController.getIngredient); //냉장고 조회

router.post("/add", verifyToken, fridgeController.addIngredient); // 재료 추가

router.delete("/:id", verifyToken, fridgeController.deleteIngredient);

router.put("/update", verifyToken, fridgeController.updateIngredient);

router.post("/analyze", verifyToken, fridgeController.analyze);

router.post("/save", verifyToken, fridgeController.saveRecipe);

module.exports = router;
