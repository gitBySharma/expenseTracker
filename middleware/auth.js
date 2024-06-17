const jwt = require("jsonwebtoken");
const User = require("../models/users.js");

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        //console.log(token);
        if (token) {
            const user = await jwt.verify(token, 'Tl1icy3VsMLRBt2g5BMnvVb9J4Ak9S1fj');
            // console.log("User = " + user.userId);
            await User.findByPk(user.userId)
                .then((user) => {
                    req.user = user;
                    next();
                })
                .catch((error) => {
                    console.log(error);
                    res.status(401).json({ message: 'Invalid token' });
                });

        } else {
            res.status(401).json({ message: "Authentication failed" });

        }

    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Authentication failed" });
    }
};