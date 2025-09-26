const express = require('express');
const cors = require("cors");
const app = express();
const {connectdb, startCronJob}= require('./helper/index');
const router = require('./router/index');
const attendanceRoutes = require('./router/attendance');
require('dotenv').config();
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = 4000;

connectdb();
startCronJob();

  
app.use(express.json());
app.use(cors());
 

app.get('/', (req, res) => {
    res.send('Hello world');
});
app.use('/api/form', router);
app.use('/api/form', attendanceRoutes);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});



