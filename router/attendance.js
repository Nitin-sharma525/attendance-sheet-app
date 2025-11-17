const express = require('express');
const router = express.Router();
const attendancecontroller =require('../controller/attendanceController');
const authenticate = require('../middleware/index');

router.post('/creatattendance', authenticate, attendancecontroller.creatattendance);
router.get('/getAllAttendance', authenticate, attendancecontroller.getAllAttendance);
router.put('/updateAttendance/:a_studentId', authenticate, attendancecontroller.updateAttendance);
router.delete('/deleteAttendance/:a_studentId', authenticate, attendancecontroller.deleteAttendance);
router.get('/getAttendance/:a_studentId', authenticate, attendancecontroller.getAttendanceByStudentId);
router.post('/createClassTeacher', authenticate, attendancecontroller.createClassTeacher);
router.post('/leaveapproved', authenticate, attendancecontroller.leaveapproved );
router.delete('/attendanceDelete', authenticate, attendancecontroller.attendanceDelete);
router.post('/joinClassResponse', authenticate, attendancecontroller.joinClassResponse);
router.post('/monthlyAttendanceReport', authenticate, attendancecontroller.monthlyAttendanceReport);
router.post('/totalUserJoinRequests', authenticate, attendancecontroller.totalUserJoinRequests);
router.put('/updatedUserByToken', authenticate, attendancecontroller.updatedUserByToken);
router.delete('/deleteuserbytoken', authenticate, attendancecontroller.deleteuserbytoken);
router.post('/createEventByTeacher', authenticate, attendancecontroller.createEventByTeacher);


module.exports=router;