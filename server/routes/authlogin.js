const express = require("express");
const router = require("express").Router();
const authloginControl = require("../controller/authloginControl");
router.post("/register", authloginControl.register);
router.post("/login", authloginControl.login);
router.post("/refresh", authloginControl.refresh);
router.post("/logout", authloginControl.logout);

module.exports = router;
