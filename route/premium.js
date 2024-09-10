const express = require('express');
const router = express.Router();


const Controller = require('../controller/premium');
const auth = require('../middleware/auth');

router.get('/leaderBoard', auth.authentication, Controller.getLeaderBoardController);

module.exports = router;