const { where } = require("sequelize");
const uuid = require('uuid');
const brevo = require("sib-api-v3-sdk");

const sequelize = require('../util/database.js');
const Users = require('../models/users.js');
const ForgotPassword = require('../models/forgotPassword.js');

require('dotenv').config();


const defaultClient = brevo.ApiClient.instance;
const ApiKeyAuth = defaultClient.authentications['api-key'];
ApiKeyAuth.apiKey = process.env.FORGOT_PASSWORD_API_KEY;


exports.forgotPassword = async (req, res, next) => {
    try {
        const apiInstance = new brevo.TransactionalEmailsApi();
        const sender = {
            email: "subhankarsharma24@gmail.com",
            name: "Sharma",
        };

        const receiver = [{
            email: req.body.email,
        }]

        const sentMail = await apiInstance.sendTransacEmail({
            sender,
            to: receiver,
            subject: "Reset Password",
            htmlContent: `<p>Click on the link to reset your password</p>`
        });

        res.status(200).json({message: "Password reset link sent to your email", data: sentMail});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal server error!! try again"})
    }
};