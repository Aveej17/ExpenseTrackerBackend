const express = require('express');
const router = express.Router();

const Controller = require('../controller/expense'); 
const auth = require('../middleware/auth');


router.post('/create', auth.authentication, Controller.createExpense);
router.get('/get',auth.authentication, Controller.getExpenses);
router.delete('/delete/:id', auth.authentication, Controller.deleteExpenses);
router.put('/edit/:id', Controller.editExpenses);
router.get('/downloadFile', auth.authentication, Controller.downloadFile);

module.exports= router;