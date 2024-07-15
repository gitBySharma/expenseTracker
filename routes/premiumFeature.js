const express = require("express");
const router = express.Router();

const premiumMembershipController = require("../controllers/premiumMembership.js");
const userAuthentication = require("../middleware/auth.js");


//handle the order creation for the purchase of premium membership
router.get('/purchase/premiumMembership', userAuthentication.authenticate, premiumMembershipController.purchasePremium);

//handle successful payment
router.post('/purchase/updateTransactionStatus', userAuthentication.authenticate, premiumMembershipController.updateTransactionStatus);

//handle displaying the leaderBoard
router.get('/leaderBoard/showLeaderboard', userAuthentication.authenticate, premiumMembershipController.showLeaderBoard);



module.exports = router;