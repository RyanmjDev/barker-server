const express = require("express");
const router = express.Router();
const passport = require("passport");


// Import your userController
const userController = require("../controllers/userController");

router.get("/", userController.getUser);
router.post("/login", passport.authenticate("local"), userController.login);
router.get("/logout", userController.logout);
router.get("/profile/:username", userController.getProfile);
router.get("/notifications",  passport.authenticate('jwt', { session: false }),userController.getNotifications);
router.get("/:username/barks", userController.getAllUserBarks);
router.get("/:username/likes", userController.getAllUserLikes);
router.get("/bookmarks",   passport.authenticate('jwt', { session: false }), userController.getAllUserBookmarks);
router.post("/:username/follow", passport.authenticate('jwt', { session: false }), userController.follow);
 


module.exports = router;
