const express = require('express');
const router = express.Router();

const Controller = require('../controller/user'); 
const auth = require('../middleware/auth');


router.post('/signup', Controller.createUser);
router.post('/login',  Controller.loginUser);


module.exports= router;