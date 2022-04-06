const dotenv = require('dotenv');
dotenv.config({ path: 'C:\\Users\\Yash\\Desktop\\ReactJS\\inotebook\\backend\\.env' });
const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;
const connectToMongo = () => {
    mongoose.connect(mongoURI,
        {
            useUnifiedTopology: true,
            useNewUrlParser: true
        },
        () => {
            console.log('Connected to mongoose succesfully');
        })
}


module.exports = connectToMongo;