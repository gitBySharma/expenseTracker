const Sequelize = require("sequelize");
const sequelize = require("../util/database.js");



const Premium = sequelize.define('premium', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    paymentId: Sequelize.STRING,
    orderId: Sequelize.STRING,
    status: Sequelize.STRING
});

module.exports = Premium;