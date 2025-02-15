// database connection
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(error => console.log("Error Connecting to MongoDB: " ,error));

module.exports = mongoose;
