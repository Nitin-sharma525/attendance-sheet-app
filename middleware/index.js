const jwt = require('jsonwebtoken');
const Attendance = require('../model/Attendance');
const User =require('../model/user');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ status: false, message: 'No token provided' });
    }

     const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   

    req.user = decoded.uuid; 
    next();

  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ status: false, message: 'Unauthorized: Invalid token or user not found' });
  }
};

module.exports = authenticate;
