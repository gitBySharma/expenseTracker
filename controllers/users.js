const Users = require('../models/users.js');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

//function handling user signup
exports.userSignup = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await Users.findOne({ where: { email: email } });  //checks if the user with entered email already exists 
        if (existingUser) {
            return res.status(400).json({ error: "User already exists, enter a new email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10); //encrypting the password using bcrypt

        //saves the data into database table
        const data = await Users.create({
            name: name,
            email: email,
            password: hashedPassword
        })

        res.status(200).json({ signupData: data });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//function to generate login token using jsonwebtoken library
function generateAccessToken(id, name) {
    return jwt.sign({ userId: id, name: name }, 'Tl1icy3VsMLRBt2g5BMnvVb9J4Ak9S1fj')
}



exports.userLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await Users.findOne({ where: { email: email } });

        //case1 - if the emailId is incorrect
        if (!user) {
            return res.status(404).json({ error: "Incorrect email, User not found", success: false });
        }

        //case2 if the emailId is correct
        const match = await bcrypt.compare(password, user.password);  //matching the entered password with the hashed password stored in database
        if (match) {
            return res.status(200).json({ data: user, message: "User logged in successfully", success: true, token: generateAccessToken(user.id, user.name) });

        } else {
            return res.status(401).json({ error: "Incorrect password", success: false });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}