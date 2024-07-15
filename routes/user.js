const express = require("express");
const router = express.Router();

const userController = require("../controllers/users.js");
const userAuthentication = require("../middleware/auth.js");
const forgotPasswordController = require('../controllers/forgotPassword.js');
const expenseController = require("../controllers/expenses.js");


//handle the new user signup
router.post('/user/signup', userController.userSignup);

//handle existing user login
router.post('/user/login', userController.userLogin);

//handle forgot password (sends a reset link to users email)
router.post('/password/forgotPassword', forgotPasswordController.forgotPassword);

//handle forgot password request
router.get('/password/resetPassword/:id', forgotPasswordController.resetPassword);

//handle updating the password in database
router.post('/password/updatePassword/:id', forgotPasswordController.updatePassword);

//handle downloading of expenses
router.get('/user/download', userAuthentication.authenticate, expenseController.downloadExpense);

//handle downloading of previous expenses
router.get('/user/downloadHistory', userAuthentication.authenticate, expenseController.downloadHistory);



module.exports = router;
