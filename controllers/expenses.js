const { where } = require("sequelize");
const sequelize = require('../util/database.js');
const Expense = require("../models/expenses");
const Users = require('../models/users');
const jwt = require('jsonwebtoken');
const AWS = require("aws-sdk");
const DownloadUrls = require('../models/DownloadUrls.js');

require('dotenv').config();


exports.postAddExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    const { expenseAmount, expenseCategory, expenseDescription } = req.body;
    try {
        const data = await Expense.create({
            expenseAmount: expenseAmount,
            expenseCategory: expenseCategory,
            expenseDescription: expenseDescription,
            userId: req.user.id,
        }, { transaction: t });

        //updating the totalExpense for each user when a new expense is added
        const user = await Users.findOne({ where: { id: req.user.id } });
        let totalExpense = parseInt(user.totalExpense);
        if (isNaN(totalExpense)) {
            totalExpense = 0;
        }
        totalExpense += parseFloat(expenseAmount);

        await Users.update({
            totalExpense: totalExpense
        }, { where: { id: req.user.id }, transaction: t });

        await t.commit();

        res.status(200).json({ expenseDetails: data });

    } catch (error) {
        console.log(error);
        await t.rollback();
        res.status(404).json({ error: "Internal server error" });
    }
};


exports.getExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findAll({ where: { userId: req.user.id } });
        res.status(200).json({ expenseDetails: expense, isPremiumUser: req.user.isPremiumUser });
    } catch (error) {
        console.log(error);
        res.status(404).json({ error: "Internal server error" });
    }
};


exports.deleteExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    const expenseId = req.params.id;
    try {
        const expense = await Expense.findByPk(expenseId);
        if (expense) {
            await Expense.destroy({ where: { id: expenseId, userId: req.user.id }, transaction: t });
            res.status(200).json({ message: "User deleted successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }

        //updating the totalExpense when a expense is deleted
        const user = await Users.findOne({ where: { id: req.user.id } });

        const existingTotalExpense = parseInt(user.totalExpense);
        if (isNaN(existingTotalExpense)) {
            existingTotalExpense = 0;
        }
        const newTotalExpense = existingTotalExpense - (parseFloat(expense.expenseAmount));

        await Users.update({
            totalExpense: newTotalExpense
        }, { where: { id: req.user.id }, transaction: t });

        t.commit();

    } catch (error) {
        console.log(error);
        t.rollback();

        res.status(500).json({ error: "Internal server error" });
    }
};


exports.editExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    const expenseId = req.params.id;
    const { expenseAmount, expenseCategory, expenseDescription } = req.body;
    try {
        const expense = await Expense.findOne({ where: { id: expenseId, userId: req.user.id } });
        if (expense) {
            //calculating the difference between old and new expense amounts
            const oldExpenseAmount = parseFloat(expense.expenseAmount);
            const newExpenseAmount = parseFloat(expenseAmount);
            const expenseDifference = newExpenseAmount - oldExpenseAmount;

            await expense.update({ expenseAmount, expenseCategory, expenseDescription }, { transaction: t });   //updating the expense

            //updating the totalExpense for the user
            const user = await Users.findOne({ where: { id: req.user.id } });
            let totalExpense = parseInt(user.totalExpense);
            if (isNaN(totalExpense)) {
                totalExpense = 0;
            }
            totalExpense += expenseDifference;

            await Users.update({
                totalExpense: totalExpense
            }, { where: { id: req.user.id }, transaction: t });

            t.commit();

            res.status(200).json({ updatedExpense: expense });

        } else {
            t.rollback();
            res.status(404).json({ error: "Expense not found" });
        }
    } catch (error) {
        console.log(error);
        t.rollback();

        res.status(500).json({ error: "Internal server error" });
    }
};


async function uploadToS3(data, fileName) {
    const s3bucket = new AWS.S3({
        accessKeyId: process.env.IAM_USER_KEY,
        secretAccessKey: process.env.IAM_USER_SECRET,
        Bucket: "iam1expensetracker"
    });

    var params = {
        Bucket: "iam1expensetracker",
        Key: fileName,
        Body: data,
        ACL: "public-read"
    }

    try {
        const response = await s3bucket.upload(params).promise();   //.promise() returns a promise
        //console.log("Success", response);
        return response.Location;

    } catch (error) {
        console.log("Error", error);

    }
}


exports.downloadExpense = async (req, res, next) => {
    try {
        const expenses = await Expense.findAll({ where: { userId: req.user.id } });
        const stringifiedExpenses = JSON.stringify(expenses);
        const fileName = `Expenses${req.user.id}/${new Date().toISOString()}.txt`;
        const fileUrl = await uploadToS3(stringifiedExpenses, fileName);

        await DownloadUrls.create({   //storing the history od downloads
            fileUrl: fileUrl,
            userId: req.user.id
        })
        res.status(201).json({ fileUrl, success: true });

    } catch (error) {
        console.log("Error", error);
        res.status(500).json({ Error: "Something went wrong", success: false });
    }
};



exports.downloadHistory = async (req, res, next) => {
    try {
        const history = await DownloadUrls.findAll({ where: { userId: req.user.id } });
        if (history) {
            res.status(201).json({ history, success: true });

        } else {
            res.status(400).json({ Error: "No download history found" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Something went wrong", success: false });
    }
};