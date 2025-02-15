const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { email, password, role } = req.body;
    const hasedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
        email, 
        password: hasedPassword,
        role
    });

    try {
        await user.save();
        res.json({ message: "User Registered"});
    } catch (error) {
        res.status(400).json({ message: "Error registering the user"});
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.find({email}); // query to search for matching email as entered in the form

    if(!user)
        return res.status(400).json({ message: "User not found"});

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) 
        return res.status(400).json({message: "Invalid Credemtials"});

    const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});
    res.json({token, role: user.role, email: user.email});
}