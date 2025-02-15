require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require("helmet");
const mongoose = require('./config/dbConfig');
const authRoutes = require('./routes/authRoutes');

// initialise an instance of express as app
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// auth route
app.use('/api/v2/auth', authRoutes);

const PORT = process.env.PORT || 5018;
app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`);
});


