const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Expense = sequelize.define("expenseDetails", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    expenseAmount: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    expenseCategory: {
        type: Sequelize.STRING,
        allowNull: false
    },
    expenseDescription: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Expense;