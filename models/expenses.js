const Sequelize = require("sequelize");

const sequelize = require("../util/database.js");

const Expenses = sequelize.define("expenses", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }

})

module.exports = Expenses;