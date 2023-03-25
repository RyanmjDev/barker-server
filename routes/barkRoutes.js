const express = require('express');
const router = express.Router();
const { getAllBarks, listBarks, createBark, deleteBark } = require('../controllers/barkController');

router.get('/', getAllBarks);
router.get('/', listBarks);
router.post('/', createBark);
router.delete('/:barkId', deleteBark);



  

module.exports = router;
