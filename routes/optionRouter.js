const express = require('express');
const { getAllOptions } = require('../controllers/optionController');

const router = express.Router();

router.route('/').get(getAllOptions);

module.exports = router;
