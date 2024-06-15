const Expense = require("../models/expenses");

exports.postAddExpense = async (req, res, next) => {
    const { expenseAmount, expenseCategory, expenseDescription } = req.body;
    try {
        const data = await Expense.create({
            expenseAmount: expenseAmount,
            expenseCategory: expenseCategory,
            expenseDescription: expenseDescription
        });
        res.status(200).json({ expenseDetails: data });

    } catch (error) {
        console.log(error);
    }
};


exports.getExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findAll();
        res.status(200).json({ expenseDetails: expense });
    } catch (error) {
        console.log(error);
        res.status(404).json({ error: "Internal server error" });
    }
};


exports.deleteExpense = async (req, res, next) => {
    const expenseId = req.params.id;
    try {
        const expense = await Expense.findByPk(expenseId);
        if (expense) {
            await Expense.destroy({ where: { id: expenseId } });
            res.status(200).json({ message: "User deleted successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.editExpense = async (req, res, next) => {
    const expenseId = req.params.id;
    const { expenseAmount, expenseCategory, expenseDescription } = req.body;
    try {
        const expense = await Expense.findByPk(expenseId);
        if (expense) {
            await expense.update({ expenseAmount, expenseCategory, expenseDescription });
            res.status(200).json({ updatedExpense: expense });
        } else {
            res.status(404).json({ error: "Expense not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};