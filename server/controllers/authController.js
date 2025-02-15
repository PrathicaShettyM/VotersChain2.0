const {check, validateResult} = require("express-validator");
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const errors = validateResult(req);
    if(!errors.isEmpty())
        return res.status(400).json({errors: error.array()});

    const { email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({email});
        if (existingUser) return res.status(400).json({ message: "Email already exists" });
        
        const hasedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
                email, 
                password: hasedPassword,
                role
            });
        await user.save();

        res.json({ message: "User Registered Successfully"});
    } catch (error) {
        res.status(500).json({ message: "Server Error"});
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
        const user = await User.find({email});
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) 
            return res.status(400).json({message: "Invalid Credemtials"});
        
        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});  
        res.json({token, role: user.role, email: user.email});

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}