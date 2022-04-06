const dotenv = require('dotenv');
dotenv.config();
const connectToMongo = require('../db');
const express = require('express');
const cors = require('cors');

connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({origin: true}))
app.use(express.json());

// Available Routes
app.get('/', (req, res)=>{
  res.send('iNotebook backend');
})
app.use('/api/auth', require('../routes/auth'));
app.use('/api/notes', require('../routes/notes'));

app.listen(port, () => {
  console.log(`iNotebook backend listening at Heroku`)
});