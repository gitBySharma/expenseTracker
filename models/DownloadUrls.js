const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const DownloadUrls = sequelize.define("downloadUrls", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    fileUrl: {
        type: Sequelize.STRING,
    }
});

module.exports = DownloadUrls;