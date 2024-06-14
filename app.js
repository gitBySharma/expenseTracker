const path = require("path");
const express = require("express");
const cors = require("cors");

const sequelize = require("./util/database.js");

const Users = require("./models/users.js");

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


//middleware to handle the new user signup
app.post('/user/signup', async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await Users.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists, enter a new email" });
        }
        const data = await Users.create({
            name: name,
            email: email,
            password: password
        })

        res.status(200).json({ signupData: data });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


//middleware to handle existing user login
app.post('/user/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await Users.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ error: "Incorrect email, User not found", success: false });
        }
        if (user.password === password) {
            return res.status(200).json({ message: "User logged in successfully", success: true });
        } else {
            return res.status(401).json({ error: "Incorrect password", success: false });
        }

    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});



sequelize.sync()
    .then((result) => {
        app.listen(3000);
        console.log("Server is live in port 3000");
    }).catch((err) => {
        console.log(err);
    });
