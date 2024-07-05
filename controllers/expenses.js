const { where } = require("sequelize");
const sequelize = require('../util/database.js');
const Expense = require("../models/expenses");
const Users = require('../models/users');
const jwt = require('jsonwebtoken');


exports.postAddExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    const { expenseAmount, expenseCategory, expenseDescription } = req.body;
    try {
        const data = await Expense.create({
            expenseAmount: expenseAmount,
            expenseCategory: expenseCategory,
            expenseDescription: expenseDescription,
            userId: req.user.id,
        }, {transaction: t});

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
            await Expense.destroy({ where: { id: expenseId, userId: req.user.id }, transaction: t});
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
        }, { where: { id: req.user.id }, transaction: t});

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

            await expense.update({ expenseAmount, expenseCategory, expenseDescription }, {transaction: t});   //updating the expense

            //updating the totalExpense for the user
            const user = await Users.findOne({ where: { id: req.user.id } });
            let totalExpense = parseInt(user.totalExpense);
            if (isNaN(totalExpense)) {
                totalExpense = 0;
            }
            totalExpense += expenseDifference;

            await Users.update({
                totalExpense: totalExpense
            }, { where: { id: req.user.id }, transaction: t});

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