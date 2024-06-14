const path = require("path");
const express = require("express");
const cors = require("cors");

const sequelize = require("./util/database.js");

const Users = require("./models/users.js");
const userController = require("./controllers/users.js");

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


//middleware to handle the new user signup
app.post('/user/signup', userController.userSignup);


//middleware to handle existing user login
app.post('/user/login', userController.userLogin);



sequelize.sync()
    .then((result) => {
        app.listen(3000);
        console.log("Server is live in port 3000");
    }).catch((err) => {
        console.log(err);
    });
