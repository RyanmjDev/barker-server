const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getAllBarks, listBarks, createBark, deleteBark, getBarkById,
likeBark, getAllUserBarks, postReply, getReplies, bookmarkBark } = require('../controllers/barkController');

router.get('/', getAllBarks);
router.post('/',  passport.authenticate('jwt', { session: false }), createBark);

router.get('/:barkId', getBarkById);
router.post('/:barkId', passport.authenticate('jwt', { session: false }), postReply);

router.get('/:barkId/replies', getReplies); // Returns Bark Replies
router.post('/:barkId/like',passport.authenticate('jwt', { session: false }), likeBark); // Lets User like a Bark
router.post('/:barkId/bookmark',passport.authenticate('jwt', { session: false }), bookmarkBark); 

router.delete('/:barkId', passport.authenticate('jwt', { session: false }), deleteBark);



  

module.exports = router; 
