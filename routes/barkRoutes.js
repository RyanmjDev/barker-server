const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getAllBarks, listBarks, createBark, deleteBark, getBarkById,
likeBark } = require('../controllers/barkController');

router.get('/', getAllBarks);
router.get('/', listBarks);
router.post('/',  passport.authenticate('jwt', { session: false }), createBark);
router.get('/:barkId', getBarkById);

router.post('/:barkId/like',passport.authenticate('jwt', { session: false }), likeBark);

router.delete('/:barkId', deleteBark);



  

module.exports = router;
