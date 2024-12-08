
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT_NUMBER||3001;
require('dotenv').config();
const clientURL = process.env.CLIENT_URL || 'http://localhost:3000'
const apiURL = process.env.API_URL || 'http://localhost:3001'
const authRoutes = require('./src/Routes/AuthRoutes'); 
const emailRoutes = require('./src/Routes/EmailsRoutes')
const dataRoutes = require('./src/Routes/ClientRoutes')
app.use(express.json()); 
app.use(cors({ origin: clientURL, credentials: true }));
app.use(bodyParser.json());

app.use('/Api/Auth', authRoutes); 
app.use('/Api/EMail', emailRoutes);
app.use('/Api/Client', dataRoutes)

app.listen(port, () => {
  console.log(`Server running on ${apiURL}${port}`);
});
