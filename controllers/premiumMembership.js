const Razorpay = require('razorpay');
const Premium = require('../models/premiumMembership');
const { where } = require('sequelize');

require('dotenv').config();

exports.purchasePremium = async (req, res, next) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const amount = 2500;

        rzp.orders.create({ amount, currency: "INR" }, async (error, order) => {
            if (error) {
                console.log(error);
                return res.status(404).json({ message: "Failed to create order", error: error });
            }

            try {
                await Premium.create({
                    orderId: order.id,
                    status: "PENDING",
                    userId: req.user.id
                });

                return res.status(201).json({ order, key_id: rzp.key_id });

            } catch (error) {
                console.log(error);
                return res.status(404).json({ message: "Failed to create order in database", error: error });
            }

            // req.user.createPremium({
            //     orderId: order.id,
            //     status: "PENDING"

            // }).then((result) => {
            //     return res.status(201).json({ order, key_id: rzp.key_id });

            // }).catch((err) => {
            //     console.log(err);
            // });
        })

    } catch (error) {
        console.log(error);
        res.status(403).json({ message: "Something went wrong", error: err });
    }
};



exports.updateTransactionStatus = async (req, res, next) => {
    try {
        const { payment_id, order_id } = req.body;

        const premiumMembership = await Premium.findOne({ where: { orderId: order_id } })

        if (premiumMembership) {

            if (payment_id === "payment_failed") {

                await premiumMembership.update({ status: "FAILED" });
                return res.status(401).json({ success: false, message: "Payment failed" });

            } else {
                await premiumMembership.update({ paymentId: payment_id, status: "SUCCESSFUL" });  //updating the paymentId and status
                await req.user.update({ isPremiumUser: true });  //making the user premium
                return res.status(201).json({ success: true, message: "Transaction successful" });

            }

        } else {
            res.status(404).json({ success: false, message: "Premium membership not found" });

        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
};