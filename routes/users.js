const express = require("express");
const router = express.Router();
const passport = require("passport");

// Import your userController
const userController = require("../controllers/userController");

router.get("/", userController.getUser);
router.post("/login", passport.authenticate("local"), userController.login);
router.get("/logout", userController.logout);
router.get("/profile/:username", userController.getProfile);
router.get("/:username/barks", userController.getAllUserBarks);



module.exports = router;
