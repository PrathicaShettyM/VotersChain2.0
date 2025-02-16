require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require("helmet");
const bodyParser = require('body-parser');
const mongoose = require('./config/dbConfig');
const cookieParser = require("cookie-parser");

// initialise an instance of express as app
const app = express();


// make api connection to the frontend
app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'POST'],
    credentials: true, // allow cookies
}));

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// auth route
const authRoutes = require('./routes/authRoutes')
app.use('/', authRoutes);

// voter registration route
const voterRoutes = require('./routes/voterRoutes');
app.use('/', voterRoutes);

// candidate registration route
const candidateRoutes = require('./routes/candidateRoutes');
app.use('/', candidateRoutes);

// election registration route
const electionRoutes = require('./routes/electionRoutes');
app.use('/', electionRoutes);


// set election candidates
const electionCandidateRoutes = require("./routes/electionCandidateRoutes");
app.use("/", electionCandidateRoutes);

const elections = require('./routes/electionPageRoute');
app.use("/", elections);







const PORT = process.env.PORT || 5018;
app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`);
});


