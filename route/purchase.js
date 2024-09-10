const express = require('express');
const router = express.Router();


const Controller = require('../controller/purchase');
const auth = require('../middleware/auth');

router.get('/premiumMembership', auth.authentication, Controller.purchaseCreateController);
router.post('/updateTransactionStatus', auth.authentication, Controller.updatePurchaseController);

module.exports = router;