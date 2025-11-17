const express = require('express');//Imports the Express framework
const router = express.Router();
const authcontroller = require('../controller/auth');
const upload = require('../middleware/upload');
const eventcontroller=require('../controller/eventcontroller');
const authenticate = require('../middleware/index');


router.post('/userregister', upload.single('u_profileImage'), authcontroller.userregister);
router.post('/userlogin',authcontroller.userlogin);
router.put('/updateduser/:u_uuid', authcontroller.updateduser);
router.delete('/userdelete/:u_uuid',authcontroller.userdelete);
router.get('/getalluser/:u_uuid', authcontroller.getalluser);
router.get('/attendance/status/:a_studentId', authcontroller.getAttendanceStatus);
router.get('/getUserProfile/:u_uuid', authcontroller.getUserProfile);
router.put('/updateprofile/:u_uuid', authcontroller.updateprofile);
router.post('/changepassword/:u_uuid', authcontroller.changepassword);
router.post('/joinclass/:u_uuid', authcontroller.joinClass);
router.get('/getclass/:u_uuid', authcontroller.getClass);
router.post('/createEvent', eventcontroller.createEvent);
router.post('/leaveClass/:u_uuid', authcontroller.leaveClass);
router.post('/eventaccepted', eventcontroller.eventaccepted);
router.post('/approveUserRequest', authcontroller.approveUserRequest);
router.post('/userlist', authcontroller.userlist);
router.post('/sendEmail',authcontroller.sendEmail);
router.post('/forgotpassword',authcontroller.forgotPasswordSendOtp)
router.post('/resetPasswordWithOtp',authcontroller.resetPasswordWithOtp);
router.post('/upload/:u_uuid', upload.array('images', 5),authcontroller.uploadProfileImage);
router.post('/verifyEmailOtp',authcontroller.verifyEmailOtp);
router.post('/socialLogin',authcontroller.socialLogin);
router.post('/facebookLogin',authcontroller.facebookLogin);





module.exports = router;



