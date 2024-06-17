const path = require("path");
const express = require("express");
const cors = require("cors");

const sequelize = require("./util/database.js");

const User = require("./models/users.js");
const Expense = require("./models/expenses.js");
const userController = require("./controllers/users.js");
const expenseController = require("./controllers/expenses.js");
const userAuthentication  = require("./middleware/auth.js");

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


//middleware to handle the new user signup
app.post('/user/signup', userController.userSignup);


//middleware to handle existing user login
app.post('/user/login', userController.userLogin);


//middleware to handle adding new expense
app.post('/expense/addExpense',userAuthentication.authenticate, expenseController.postAddExpense);


//middleware to handle retrieving existing expense
app.get('/expense/getExpense', userAuthentication.authenticate, expenseController.getExpense);


//middleware to handle deleting expense
app.delete('/expense/deleteExpense/:id',userAuthentication.authenticate, expenseController.deleteExpense);


//middleware to handle editing an existing expense
app.put('/expense/editExpense/:id',userAuthentication.authenticate, expenseController.editExpense);


User.hasMany(Expense, {foreignKey: 'userId'});
Expense.belongsTo(User, {foreignKey: 'userId'});

sequelize.sync()
    .then((result) => {
        app.listen(3000);
        console.log("Server is live in port 3000");
    }).catch((err) => {
        console.log(err);
    });
