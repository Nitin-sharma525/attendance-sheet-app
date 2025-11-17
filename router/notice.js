const express = require('express');
const router = express.Router();
const noticecontroller = require('../controller/notice');
const authenticate = require('../middleware/index');

router.post('/createNotice', authenticate, noticecontroller.createNotice);
router.put('/updateNotice/:id', authenticate, noticecontroller.updateNotice);
router.delete('/deleteNotice/:id', authenticate, noticecontroller.deleteNotice);
router.get('/getAllNotices', authenticate, noticecontroller.getAllNotices);
router.get('/getNoticeById/:id', authenticate, noticecontroller.getNoticeById);

module.exports = router;