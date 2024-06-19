const Sequelize = require("sequelize");
require('dotenv').config();

const sequelize = new Sequelize('expense', 'root', process.env.DB_PASSWORD, {
    dialect: "mysql",
    host: "localhost"
});

module.exports = sequelize;