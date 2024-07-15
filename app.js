const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const router = require("router");
const morgan  = require("morgan");

require('dotenv').config();

const sequelize = require("./util/database.js");

const User = require("./models/users.js");
const Expense = require("./models/expenses.js");
const Premium = require("./models/premiumMembership.js");
const ForgotPassword = require('./models/forgotPassword.js');
const DownloadUrls = require('./models/DownloadUrls.js');

const userRoutes = require("./routes/user.js");
const expenseRoutes = require("./routes/expense.js");
const premiumFeatureRoutes = require("./routes/premiumFeature.js");

const { FORCE } = require("sequelize/lib/index-hints");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(morgan("combined", {stream: accessLogStream}));


app.use(userRoutes);
app.use(expenseRoutes);
app.use(premiumFeatureRoutes);


//database relations
User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Premium);
Premium.belongsTo(User);

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

User.hasMany(DownloadUrls);
DownloadUrls.belongsTo(User);


sequelize.sync()
    .then((result) => {
        app.listen(process.env.PORT);
        console.log(`Server is live in port ${process.env.PORT}`);
    }).catch((err) => {
        console.log(err);
    });