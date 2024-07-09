const { where } = require("sequelize");
const uuid = require('uuid');
const brevo = require("sib-api-v3-sdk");
const bcrypt = require('bcrypt');

const sequelize = require('../util/database.js');
const Users = require('../models/users.js');
const ForgotPassword = require('../models/forgotPassword.js');

require('dotenv').config();


const defaultClient = brevo.ApiClient.instance;
const ApiKeyAuth = defaultClient.authentications['api-key'];
ApiKeyAuth.apiKey = process.env.FORGOT_PASSWORD_API_KEY;


exports.forgotPassword = async (req, res, next) => {
    try {

        const { email } = req.body;
        const user = await Users.findOne({ where: { email: email } });
        if (user) {
            const id = uuid.v4();
            await ForgotPassword.create({ id: id, active: true, userId: user.id });

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
                htmlContent: `<a href="http://localhost:3000/password/resetPassword/${id}">Reset password</a>`
            });

            return res.status(200).json({ message: "Password reset link sent to your email", data: sentMail });

        } else {
            return res.status(400).json({ message: "User not found" });
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error!! try again" })
    }
};



exports.resetPassword = async (req, res, next) => {
    try {
        const id = req.params.id;
        const forgotPasswordRequest = await ForgotPassword.findOne({ where: { id: id } });
        console.log(forgotPasswordRequest);

        if (forgotPasswordRequest) {
            await forgotPasswordRequest.update({ active: false });

            res.status(200).send(`<html>
                <script>
                    function formsubmitted(e){
                        e.preventDefault();
                        console.log('called')
                    }
                </script>

                <form action="/password/updatePassword/${id}" method="post">
                    <label for="newPassword">Enter New password</label>
                    <input name="newPassword" type="password" required></input>
                    <button>Reset Password</button>
                </form>
            </html>`)

            res.end();
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};



exports.updatePassword = async (req, res, next) => {
    console.log(req.body.newPassword);
    console.log(req.params.id);

    try {
        const resetPasswordRequest = await ForgotPassword.findOne({ where: { id: req.params.id } });
        if (resetPasswordRequest) {
            const user = await Users.findOne({ where: { id: resetPasswordRequest.userId } });

            if (user) {
                const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);  //encrypting the password
                await user.update({ password: hashedPassword });
                res.status(201).json({ message: "Password Successfully updated" });

            } else {
                res.status(400).json({ message: "User not found" });
            }

        } else {
            res.status(401).json({ error: "Reset password request is not valid" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }

};