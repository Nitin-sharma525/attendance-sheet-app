const express = require('express');
const router = express.Router();
const syllabuscontroller = require('../controller/syllabuscontroller');
const authenticate = require('../middleware/index');


router.post('/createSyllabus', authenticate, syllabuscontroller.createSyllabus);
router.put('/updateSyllabus/:classid',authenticate,syllabuscontroller.updateSyllabus);
router.delete('/deletesyllabus/:classid',authenticate,syllabuscontroller.deletesyllabus);
router.get('/getallsyllabus',authenticate,syllabuscontroller.getallsyllabus);

module.exports = router;